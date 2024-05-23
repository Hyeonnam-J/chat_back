const server = require('http').createServer();
const io = require('socket.io')(server);

io.on('connection', client => {
    client.on('event', data => {
        console.log('connect');
    });

    client.on('disconnect', () => {
        console.log('disconnect');
    });
});

server.listen(3000);