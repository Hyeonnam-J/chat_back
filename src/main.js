/*
 * 진입
 */

const net = require('net');

const PORT = 3000;
const HOST = '127.0.0.1';

const server = net.createServer( (socket) => {
    console.log('클라이언트 연결 됨', socket.remoteAddress, socket.remotePort);
    socket.write('웰컴');

    socket.on('data', (data) => {
        console.log('받은 데이터: ', data.toString());

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