'use strict';

const net = require('net');
const ID = require('./js/id.js');
const Chat = require('./js/chat.js');
const fs = require('fs');

let HOST;
let PORT;

const clients = [];

const filePath = '/home/hn/project/chat_etc/server.txt';
fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
        console.log('에러: ', err);
    } else {
        console.log('서버 정보: ', data);

        const seperator = data.indexOf('/');
        const strHost = data.substring(0, seperator).trim();
        const strPort = data.substring(seperator + 1).trim();

        const hostSeperator = strHost.indexOf(':');
        const portSeperator = strPort.indexOf(':');
        const _host = strHost.substring(hostSeperator + 1).trim();
        const _port = strPort.substring(portSeperator + 1).trim();

        HOST = _host;
        PORT = _port;

        // 실행 알림 출력
        server.listen(PORT, HOST, () => {
            console.log(`서버 실행 중 포트: ${PORT}, 호스트: ${HOST}`);
        });
    }
});

// 클라이언트 연결될 때마다 실행
const server = net.createServer((socket) => {
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