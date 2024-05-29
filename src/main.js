'use strict';

const { app } = require('electron');

const net = require('net');
const ID = require('./js/id.js');
const Chat = require('./js/chat.js');
const { getServerInfo, getStateInfo, deleteClientsInfo, readClientsInfo, changeStateValueToAbnormal, appendClientInfo } = require('./js/files.js');

let host, port;
const clients = [];

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
        switch(response){
            case 'normal':
                // 정상 종료 후 정상 실행.
                console.log('야호 정상!');

                // clients.txt 파일 초기화.
                deleteClientsInfo();
                
                return ;
            case 'abnormal':
                // 비정상 종료 후 긴급 실행.
                console.log('ㅠㅠ 비정상!');

                // todo: clients.txt 읽어와서 연결.
                readClientsInfo()
                    .then(data => {
                        // clients.txt 파일 초기화.
                        deleteClientsInfo();

                        data.forEach(d => {
                            console.log('state: abnormal / ', d);

                            const _socket = new net.Socket();
                            _socket.connect(d.remotePort, d.remoteAddress, () => {
                                console.log('서버는 연결 신청 완료');
                            });
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

    // 비정상 종료를 대비한 클라이언트 정보 외부 파일에 저장.
    const clientInfo = {
        remoteAddress: socket.remoteAddress,
        remotePort: socket.remotePort
    };
    appendClientInfo(JSON.stringify(clientInfo) + '\n');    // 동기적으로 작동.
    clients.push(socket);

    socket.on('data', (data) => {
        const json_data = data.toString();
        const obj_data = JSON.parse(json_data);
        console.log('클라이언트로부터 받은 메시지: ', json_data);

        if(obj_data.infoType === Chat.INFO_TYPE.requestClientSocketInfoWithId){ // 아이디가 없는, 이제 막 연결한 유저면,
            // 로그인 기능 생략. 접속한 순서대로 id 발급.
            // clients[] 대신 socket으로 방금 접속한 이에게만 전송.
            id = ID.countId++;
            nick = obj_data.nick;
            const welcomeChat = new Chat(id, nick, `어서오세요 ${nick} 님 !`, Chat.INFO_TYPE.responseClientSocketInfoWithId, socket.remotePort, socket.remoteAddress);
            socket.write(JSON.stringify(welcomeChat));

            // 지금 clients를 순회하면서 새 유저 입장 알림 후 clients 목록에 새 유저 추가.
            const entranceAlarm = new Chat(id, nick, `${nick}님이 대화방에 입장하셨습니다`, Chat.INFO_TYPE.inform, socket.remotePort, socket.remoteAddress);
            clients.forEach(c => {
                // 입장 인사는 다른 사람들에게만,
                if(c !== socket) c.write(JSON.stringify(entranceAlarm));
            });

            console.log('클라이언트 수: ', clients.length);
        } else if (obj_data.infoType === Chat.INFO_TYPE.requestClientSocketInfo){    // 서버 재시작으로 이미 아이디는 가지고 있다면,
            id = obj_data.id;
            nick = obj_data.nick;
            
            const socketInfoChat = new Chat(id, nick, '재시작 미안 !', Chat.INFO_TYPE.responseClientSocketInfo, socket.remotePort, socket.remoteAddress);
            socket.write(JSON.stringify(socketInfoChat));
        } else if (obj_data.infoType === Chat.INFO_TYPE.message){    // 그냥 메시지면,
            console.log('그냥 메시지면...');
            const newChat = new Chat(id, nick, obj_data.message, Chat.INFO_TYPE.message, socket.remotePort, socket.remoteAddress);
            console.log(JSON.stringify(newChat));
            clients.forEach(c => {
                c.write(JSON.stringify(newChat));
            });
        }
    });

    // end -> 클라이언트가 소켓 연결을 닫을 때 발생.
    socket.on('end', () => {
        console.log(`${id}번 클라이언트 연결 종료`);

        // 먼저 클라이언트 목록에서 지우고,
        const index = clients.indexOf(socket);
        if (index !== -1) clients.splice(index, 1);

        // 나머지 클라이언트들에게 알림.
        clients.forEach(c => {
            const exitAlarm = new Chat(id, nick, `${nick}님이 대화방을 나가셨습니다.`, Chat.INFO_TYPE.inform, socket.remotePort, socket.remoteAddress);
            c.write(JSON.stringify(exitAlarm));
        });

        console.log('클라이언트 수: ', clients.length);
    })
});

/**
 * 서버 강제 종료 시를 대비한 로직.
 * 정상 종료하더라도 메서드가 작동하기 때문에
 * 정상 종료 시에는 state.txt의 값을 정상으로 바꿔줘야 한다.
 */
app.on('before-quit', () => {
    changeStateValueToAbnormal();
    console.log('execute before-quit logic');
})