'user strict';

const fs = require('fs');

const filePath = '/home/hn/project/chat_etc/server.txt';

const getServerInfo = function(){
    return new Promise((resolve, rejects) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                rejects(err);
            } else {
                const seperator = data.indexOf('/');
                const strHost = data.substring(0, seperator).trim();
                const strPort = data.substring(seperator + 1).trim();
        
                const hostSeperator = strHost.indexOf(':');
                const portSeperator = strPort.indexOf(':');
                const _host = strHost.substring(hostSeperator + 1).trim();
                const _port = strPort.substring(portSeperator + 1).trim();
        
                resolve({host: _host, port: _port});
            }
        });        
    })
}

module.exports = { getServerInfo };
