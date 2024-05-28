'use strict';

const { app } = require('electron');

const net = require('net');
const ID = require('./js/id.js');
const Chat = require('./js/chat.js');
const { getServerInfo, getStateInfo, deleteClientsInfo, readClientsInfo, changeStateValueToAbnormal, appendClientInfo } = require('./js/files.js');

let host,port;
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

// 상태 정보 가져오기.
getStateInfoFromFiles();
async function getStateInfoFromFiles(){
    try {
        const response = await getStateInfo();
        switch(response){
            case 'normal':
                // 정상 종료 후 정상 실행.

                // clients.txt 파일 초기화.
                deleteClientsInfo();

                console.log('야호 정상!');
                return ;
            case 'abnormal':
                // 비정상 종료 후 긴급 실행.

                // todo: clients.txt 읽어와서 연결.
                readClientsInfo()
                    .then(data => {
                        console.log('my-typeof', typeof data);
                        data.forEach(d => {
                            // todo: 배열 순회하면서 클라이언트에게 알림.
                            console.log('my-', d);
                        })
                    })
                    .catch(e => {
                        console.log(e);
                    })

                console.log('ㅠㅠ 비정상!');
                return ;
        }
    } catch(e) {
        console.log('상태 정보를 불러오지 못했습니다.');
        console.log(e);
    }
}

// 통신 로직.
// 클라이언트 연결될 때마다 실행
const server = net.createServer((socket) => {
    // 비정상 종료를 대비한 클라이언트 정보 외부 파일에 저장.
    const clientInfo = {
        remoteAddress: socket.remoteAddress,
        remotePort: socket.remotePort
    };
    appendClientInfo(JSON.stringify(clientInfo) + '\n');    // 동기적으로 작동.
    
    // 로그인 기능 생략. 접속한 순서대로 id 발급.
    // clients[] 대신 socket으로 방금 접속한 이에게만 전송.
    const id = ID.countId++;
    let nick = '없음';

    const welcomeMessage = new Chat(id, null, 'Welcome !', Chat.INFO_TYPE.alarm, true);
    socket.write(JSON.stringify(welcomeMessage));
    console.log('클라이언트 연결 됨', socket.remoteAddress, ':', socket.remotePort, '/ id: ', id);

    socket.on('data', (data) => {
        const json_data = data.toString();
        const obj_data = JSON.parse(json_data);

        console.log('클라이언트로부터 받은 메시지: ', json_data);

        // 다른 방법이..
        // 다른 유저들에게 새 유저 입장 알림 후 클라이언트 목록에 새로 추가.
        if (obj_data.issued) {
            nick = obj_data.nick;
            const entranceAlarm = new Chat(obj_data.id, obj_data.nick, `${obj_data.nick}님이 대화방에 입장하셨습니다`, Chat.INFO_TYPE.alarm, false);
            clients.forEach(c => {
                c.write(JSON.stringify(entranceAlarm));
            });
            clients.push(socket);
            console.log('클라이언트 수: ', clients.length);
        } else {
            // 유저에게 받은 메시지를 접속한 모든 유저에게 다시 보내는 로직
            const newMessage = new Chat(obj_data.id, obj_data.nick, obj_data.message, Chat.INFO_TYPE.message, false);
            clients.forEach(c => {
                c.write(JSON.stringify(newMessage));
            })
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
            const exitAlarm = new Chat(id, nick, `${nick}님이 대화방을 나가셨습니다.`, Chat.INFO_TYPE.alarm, false);
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