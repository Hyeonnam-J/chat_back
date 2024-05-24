/*
 * 진입
 */

const net = require('net');
const id = require('./js/id.js');
const Chat = require('./js/chat.js');

const PORT = 3000;
const HOST = '127.0.0.1';

const clients = [];

// 클라이언트 연결될 때마다 실행
const server = net.createServer( (socket) => {
    // 로그인 기능 생략. 접속한 순서대로 id 발급.
    // 방금 접속한 이에게만 전송
    const m_id = id.countId++;
    const welcomeMessage = new Chat(m_id.toString(), 'Welcome !', Chat.infoType.entrance, Chat.infoOrigin.self);
    socket.write(JSON.stringify(welcomeMessage));
    console.log('클라이언트 연결 됨', socket.remoteAddress, ':', socket.remotePort, '/ id: ', m_id);

    // 다른 유저들에게 새 유저 입장 알림 후 클라이언트 목록에 새로 추가.
    clients.forEach(c => {
        const entranceAlaramMessage = new Chat(m_id.toString(), `${m_id}님이 입장하셨습니다`, Chat.infoType.entrance, Chat.infoOrigin.others);
        c.write(JSON.stringify(entranceAlaramMessage));
    })
    clients.push(socket);
    
    socket.on('data', (data) => {
        const json_data = data.toString();
        const obj_data = JSON.parse(json_data);

        console.log(json_data);
        
        // todo
        // 유저에게 받은 메시지를 접속한 모든 유저에게 다시 보내는 로직
        const newChat = new Chat(obj_data.id, obj_data.message, Chat.infoType.message, Chat.infoOrigin.others);
        clients.forEach(c => {
            c.write(JSON.stringify(newChat));
        })
    });
    
    socket.on('end', () => {
        console.log(`${m_id}번 클라이언트 연결 종료`);

        const index = clients.indexOf(socket);
        if(index !== -1){
            clients.slice(index, 1);
        }
    })
});

// 실행 알림 출력
server.listen(PORT, HOST, () => {
    console.log(`서버 실행 중 포트: ${PORT}, 호스트: ${HOST}`);
});