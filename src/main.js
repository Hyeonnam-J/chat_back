/*
 * 진입
 */

const net = require('net');
const id = require('./js/id.js');

const PORT = 3000;
const HOST = '127.0.0.1';

const server = net.createServer( (socket) => {
    // 로그인 기능 생략. 접속한 순서대로 id 발급.
    const m_id = id.countId++;

    console.log('클라이언트 연결 됨', socket.remoteAddress, ':', socket.remotePort, '/ id: ', m_id);
    socket.write(m_id.toString());  // 데이터를 보낼 때는 문자열이어야 한다.

    socket.on('data', (data) => {
        console.log('받은 데이터: ', data.toString());
        
        const index = data.toString().indexOf('/');
        const client_id = data.toString().substring(0, index);
        const receivedData = data.toString().substring(index + 1);

        console.log(client_id);
        console.log(receivedData);
        // todo
        // 유저에게 받은 메시지를 접속한 모든 유저에게 다시 보내는 로직
    });

    socket.on('end', () => {
        console.log('클라이언트 연결 종료');
    })
});

// 실행 알림 출력
server.listen(PORT, HOST, () => {
    console.log(`서버 실행 중 포트: ${PORT}, 호스트: ${HOST}`);
});