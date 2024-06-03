'use strict';

const { app } = require('electron');
const net = require('net');
const { Mutex } = require('async-mutex');

const ID = require('./js/id.js');
const Chat = require('./js/chat.js');
const Client = require('./js/client.js');
const { getServerInfo, getStateInfo, deleteAllClientsInfo, deleteClientInfo, readClientsInfo, changeStateValueToAbnormal, appendClientInfo } = require('./js/files.js');
const { executeExceptionHandler } = require('./js/handler.js');

let host, port;
const clients = [];
const mutex = new Mutex();  // 전역적으로 하나의 뮤텍스를 공유하기 위해 전역변수로 선언.

/**
 * 서버 다운 중 기다리지 않고 나간 클라이언트 체크.
 * 
 * previousConnection - 이전 클라이언트의 수.
 * countPreviousConnection - 연결에 다시 성공하거나 실패할 때마다 +1.
 * disconnectedClients[] - 이전 클라이언트 정보 저장 객체.
 */
let previousConnection  = 0;
let countPreviousConnection = 0;
const disconnectedClients = [];

// uncaughtException 처리 중.
executeExceptionHandler();

// 서버 정보 가져오기.
getServerInfo()
    .then((response) => {
        host = response.host;
        port = response.port;

        // 실행 알림 출력
        server.listen(port, host, () => {
            console.log(`서버 실행 중 포트: ${port}, 호스트: ${host}`);
        });
    })
    .catch((response) => {
        console.log('서버 실행 실패 !');
        console.log(response);
    });

// 상태 정보 가져온 후 로직.
getStateInfoFromFiles();
async function getStateInfoFromFiles(){
    try {
        const response = await getStateInfo();
        switch(response.trim()){
            case '':
                // 새롭게 개편 후 시작.
                console.log('새롭게 시작 !');

                // clients.txt 파일 초기화.
                deleteAllClientsInfo();
                
                return ;
            case 'keep':
                // 이전과 연결된 시작.
                console.log('이어서 시작 !');

                readClientsInfo()
                    .then(data => {
                        previousConnection = data.length;
                        console.log('previousConnection: ', previousConnection);

                        // 이전 정보를 data에 담은 후 clients.txt 파일 초기화.
                        deleteAllClientsInfo();

                        console.log('지우기 전 가져온 데이터: ', data);
                        data.forEach(d => {
                            const _socket = new net.Socket();
                            _socket.connect(d.remotePort, d.remoteAddress, () => {
                                console.log('서버는 연결 신청 완료');

                                _socket.destroy();
                            });

                            // 서버가 재시작 했는데 그 전에 클라이언트들이 나가버린 경우.
                            _socket.on('error', async (e) => {
                                console.log(`서버 시작 전에 클라이언트 ${d.remoteAddress}:${d.remotePort} / ${d.id} / ${d.nick} 님, 앱 종료..`);
                                disconnectedClients.push(d);
                                await notifyDisconnectedClientsAfterChecking();
                            })
                        })
                    })
                    .catch(e => {
                        console.log(e);
                    })
                    .finally(f => {
                        console.log('finally-');
                        return ;
                    })
        }
    } catch(e) {
        console.log('상태 정보를 불러오지 못했습니다.');
        console.log(e);
    }
}

// 통신 로직.
// 클라이언트 연결될 때마다 실행
const server = net.createServer((socket) => {
    console.log('클라이언트 연결 됨', socket.remoteAddress, ':', socket.remotePort);
    let id, nick;
    let clientState;    // 서버는 수신을 한 블록에서 처리하므로 클라이언트 소켓이 끊겼을 때 닉네임 중복 체크용 소켓인지 채팅용 소켓인지 구분하기 위한 식별자.

    socket.on('data', async (data) => {
        const json_data = data.toString();
        const obj_data = JSON.parse(json_data);
        console.log('클라이언트로부터 받은 메시지: ', json_data);

        if (obj_data.infoType === Chat.INFO_TYPE.message){    // 그냥 메시지면,
            await broadcastMessage(new Chat(id, nick, obj_data.message, Chat.INFO_TYPE.message, socket.remotePort, socket.remoteAddress));

        } else if(obj_data.infoType === Chat.INFO_TYPE.requestClientSocketInfoWithId){ // 아이디가 없는, 이제 막 연결한 유저면,
            // 로그인 기능 생략. 접속한 순서대로 id 발급.
            // 뮤텍스를 통해 동시성 문제 접근.
            const release = await mutex.acquire();
            try{
                id = ID.countId++;
            } finally {
                release();
            }

            nick = obj_data.nick;
            registerClient(id, nick, socket);
            clientState = Client.STATE.chat;

            // clients[] 대신 socket으로 방금 접속한 이에게만 전송.
            const welcomeChat = new Chat(id, nick, `어서오세요 ${nick} 님 !`, Chat.INFO_TYPE.responseClientSocketInfoWithId, socket.remotePort, socket.remoteAddress);
            socket.write(JSON.stringify(welcomeChat));

            // 입장 유저 제외 나머지 유저에게 새 유저 입장 알림.
            await broadcastMessage(new Chat(id, nick, `${nick}님이 대화방에 입장하셨습니다`, Chat.INFO_TYPE.inform, socket.remotePort, socket.remoteAddress), socket);
            
            console.log('클라이언트 수: ', clients.length);

        } else if (obj_data.infoType === Chat.INFO_TYPE.requestClientSocketInfo){    // 서버 재시작으로 이미 아이디는 가지고 있다면,
            id = obj_data.id;
            nick = obj_data.nick;
            registerClient(id, nick, socket);
            clientState = Client.STATE.chat;

            const socketInfoChat = new Chat(id, nick, '서버와 연결되었습니다.', Chat.INFO_TYPE.responseClientSocketInfo, socket.remotePort, socket.remoteAddress);
            socket.write(JSON.stringify(socketInfoChat));
            await notifyDisconnectedClientsAfterChecking();
            
        } else if(obj_data.infoType === Chat.INFO_TYPE.checkDuplicatedNick){    // 닉네임 중복체크.
            clientState = Client.STATE.ready;

            readClientsInfo()
                .then(data => {
                    console.log('my-', data);
                    const isDuplicated = data.some(d => { 
                        return d.nick === obj_data.nick;
                    });

                    console.log('닉네임 중복 체크 값: ', isDuplicated);
                    socket.write(isDuplicated.toString());
                })
                .catch(e => {
                    console.error(e);
                })
        }
    });

    // end -> 클라이언트가 소켓 연결을 닫을 때 발생.
    socket.on('end', async () => {
        if(clientState === Client.STATE.chat){  // 연결 끊김에 대한 처리는 채팅 소켓에만.
            console.log(`${id}번 클라이언트 연결 종료`);

            // 먼저 클라이언트 목록에서 지우고,
            const index = clients.indexOf(socket);
            if (index !== -1) clients.splice(index, 1);

            // ref 파일 업데이트.
            deleteClientInfo(id);

            // 나머지 클라이언트들에게 알림.
            await broadcastMessage(new Chat(id, nick, `${nick}님이 대화방을 나가셨습니다.`, Chat.INFO_TYPE.inform, socket.remotePort, socket.remoteAddress));

            console.log('클라이언트 수: ', clients.length);
        }
    })
});

// 비정상 종료를 대비한 클라이언트 정보 외부 파일에 저장 및 clients[] 객체에 푸시.
function registerClient(id, nick, socket){
    const clientInfo = {
        id: id,
        nick: nick,
        remoteAddress: socket.remoteAddress,
        remotePort: socket.remotePort
    };
    appendClientInfo(JSON.stringify(clientInfo) + '\n');    // 동기적으로 작동.
    clients.push(socket);
}

// 서버 재시작 후, 서버가 종료되어있는 동안 나간 클라이언트 목록 알림.
async function notifyDisconnectedClientsAfterChecking(){
    countPreviousConnection++;
    if(previousConnection === countPreviousConnection){
        for(const dc of disconnectedClients){
            await broadcastMessage(new Chat(dc.id, dc.nick, `${dc.nick} 님이 대화방을 나가셨습니다.`, Chat.INFO_TYPE.inform, dc.remotePort, dc.remoteAddress));
        }
    }
}

/**
 * 모든 클라이언트들에게 메시지, 알림을 보내는 메서드.
 * @param {Socket} exceptSocket - 당사자에게 알림 메시지 제외시키기 위한 변수.
 */
async function broadcastMessage(message, exceptSocket = null){
    const promises = clients.map(c => sendMessage(c, message, exceptSocket));
    await Promise.all(promises);
}

// 단일 클라이언트 소켓에 메시지 전송.
function sendMessage(client, message, exceptSocket){
    return new Promise((resolve, rejects) => {
        if(client !== exceptSocket){
            client.write(JSON.stringify(message), (err) => {
                console.log('서버가 보낸 메시지: ', JSON.stringify(message));

                if(err) rejects(err);
                else resolve();
            });
        } else {
            resolve();
        }
    });
}

/**
 * 서버 강제 종료 시를 대비한 로직.
 * 정상 종료하더라도 메서드가 작동하기 때문에
 * 정상 종료 시에는 state.txt의 값을 비워줘야 하지만
 * 24시 채팅 앱이라면 종료는 언제나 비정상 종료기 때문에..
 * 
 * 굳이? 그냥 참조하는 데이터를 keep으로 바꿔놓으면 되는데.
 */
// app.on('before-quit', () => {
//     changeStateValueToAbnormal();
// });