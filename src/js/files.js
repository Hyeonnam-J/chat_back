'user strict';

const fs = require('fs');

const UTF_8 = 'utf-8';

const SERVER_INFO_PATH = '/home/hn/project/chat_etc/server.txt';
const CLIENTS_INFO_PATH = '/home/hn/project/chat_etc/clients.txt';
const STATE_INFO_PATH = '/home/hn/project/chat_etc/state.txt';

const getServerInfo = function(){
    return new Promise((resolve, rejects) => {
        fs.readFile(SERVER_INFO_PATH, UTF_8, (err, data) => {
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

const getStateInfo = function() {
    return new Promise((resolve, rejects) => {
        fs.readFile(STATE_INFO_PATH, UTF_8, (err, data) => {
            if(err){
                rejects(err);
            } else {
                resolve(data);
            }
        })
    })
}

const deleteAllClientsInfo = function() {
    try{
        fs.writeFileSync(CLIENTS_INFO_PATH, '', UTF_8);
    } catch(e) {
        console.error('파일 삭제 실패', e);
    }
}

const deleteClientsInfo = function(id) {
    let lines = fs.readFileSync(CLIENTS_INFO_PATH, UTF_8).split('\n');
    let updatedLines = lines.filter(l => {
        if(l.trim() === '') return false;

        console.log('my-', l);
        console.log('my-typeof', typeof l);

        const obj_line = JSON.parse(l);
        return obj_line.id !== id;
    });

    fs.writeFileSync(CLIENTS_INFO_PATH, updatedLines.join('\n') + '\n');
}

const readClientsInfo = function(){
    return new Promise((resolve, rejects) => {
        fs.readFile(CLIENTS_INFO_PATH, UTF_8, (err, data) => {
            if(err){
                rejects(err);
            } else {
                const lines = data.split('\n').filter(line => line.trim() !== '');  // 문자열 배열. data는 string. string.split()은 배열을 반환.
                const clientsInfo = lines.map(line => JSON.parse(line));    // JSON.parse()는 주어진 문자열이 JSON 형식이면 객체로 변환.
                resolve(clientsInfo);
            }
        })
    })
}

const changeStateValueToAbnormal = function() {
    fs.writeFileSync(STATE_INFO_PATH, 'keep', UTF_8);
}

const appendClientInfo = function(data){
    fs.appendFileSync(CLIENTS_INFO_PATH, data);
}

module.exports = { getServerInfo, getStateInfo, deleteAllClientsInfo, deleteClientsInfo, readClientsInfo, changeStateValueToAbnormal, appendClientInfo };
