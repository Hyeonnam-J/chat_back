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
    });

    socket.on('end', () => {
        console.log('클라이언트 연결 종료');
    })
});

server.listen(PORT, HOST, () => {
    console.log(`서버 실행 중 포트: ${PORT}, 호스트: ${HOST}`);
});