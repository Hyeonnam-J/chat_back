'use strict';

const net = require('net');
const id = require('./js/id.js');
const Chat = require('./js/chat.js');

const PORT = 3000;
const HOST = '127.0.0.1';

const clients = [];

// 클라이언트 연결될 때마다 실행
const server = net.createServer( (socket) => {
    // 로그인 기능 생략. 접속한 순서대로 id 발급.
    // clients[] 대신 socket으로 방금 접속한 이에게만 전송.
    const m_id = id.countId++;
    const welcomeMessage = new Chat(m_id.toString(), 'Welcome !', Chat.INFO_TYPE.alarm, true);
    socket.write(JSON.stringify(welcomeMessage));
    console.log('클라이언트 연결 됨', socket.remoteAddress, ':', socket.remotePort, '/ id: ', m_id);

    // 다른 유저들에게 새 유저 입장 알림 후 클라이언트 목록에 새로 추가.
    clients.forEach(c => {
        const entranceAlarm = new Chat(m_id.toString(), `${m_id}님이 대화방에 입장하셨습니다`, Chat.INFO_TYPE.alarm, false);
        c.write(JSON.stringify(entranceAlarm));
    });
    clients.push(socket);
    console.log('클라이언트 수: ', clients.length);
    
    socket.on('data', (data) => {
        const json_data = data.toString();
        const obj_data = JSON.parse(json_data);

        console.log('클라이언트로부터 받은 메시지: ', json_data);
        
        // 유저에게 받은 메시지를 접속한 모든 유저에게 다시 보내는 로직
        const newMessage = new Chat(obj_data.id, obj_data.message, Chat.INFO_TYPE.message, false);
        clients.forEach(c => {
            c.write(JSON.stringify(newMessage));
        })
    });
    
    socket.on('end', () => {
        console.log(`${m_id}번 클라이언트 연결 종료`);

        // 먼저 클라이언트 목록에서 지우고,
        const index = clients.indexOf(socket);
        if(index !== -1){
            clients.splice(index, 1);
        }

        // 나머지 클라이언트들에게 알림.
        clients.forEach(c => {
            const exitAlarm = new Chat(m_id, `${m_id}님이 대화방을 나가셨습니다.`, Chat.INFO_TYPE.alarm, false);
            c.write(JSON.stringify(exitAlarm));
        });

        console.log('클라이언트 수: ', clients.length);
    })
});

// 실행 알림 출력
server.listen(PORT, HOST, () => {
    console.log(`서버 실행 중 포트: ${PORT}, 호스트: ${HOST}`);
});