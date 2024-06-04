'user strict';

const fs = require('fs');

const UTF_8 = 'utf-8';

const SERVER_INFO_PATH = '/home/hn/project/chat_etc/server.txt';
const CLIENTS_INFO_PATH = '/home/hn/project/chat_etc/clients.txt';
const STATE_INFO_PATH = '/home/hn/project/chat_etc/state.txt';
const ID_INFO_PATH = '/home/hn/project/chat_etc/id.txt';

// 서버 호스트, 포트 정보 가져오기.
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

// 서버 시작 시 이전 상태와 이어지는지 식별.
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

// 클라이언트 참조 파일 읽기.
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

// 클라이언트 참조 파일에 지정 클라이언트 추가.
const appendClientInfo = function(data){
    fs.appendFileSync(CLIENTS_INFO_PATH, data);
}

// 클라이언트 참조 파일에 지정 클라이언트 삭제.
const deleteClientInfo = function(id) {
    readClientsInfo()
        .then(data => {
            const updatedData = data.filter(d => { return d.id !== id });
            const updatedLines = updatedData.map(d => JSON.stringify(d));
            fs.writeFileSync(CLIENTS_INFO_PATH, updatedLines.join('\n') + '\n');
        })
}

// 클라이언트 참조 파일의 모든 클라이언트 삭제.
const deleteAllClientsInfo = function() {
    try{
        fs.writeFileSync(CLIENTS_INFO_PATH, '', UTF_8);
    } catch(e) {
        console.error('파일 삭제 실패', e);
    }
}

// 아이디 발급 값 가져오기.
const readLastIdInfo = function(){
    return new Promise((resolve, rejects) => {
        fs.readFile(ID_INFO_PATH, UTF_8, (err, value) => {
            if(err){
                rejects(err);
            } else {
                resolve(value);
            }
        })
    })
}

// 아이디 발급 값 업데이트.
const writeLastIdInfo = function(id){
    fs.writeFileSync(ID_INFO_PATH, id.toString());
}

// 아이디 발급 값 초기화.
const deleteIdInfo = function() {
    try{
        fs.writeFileSync(ID_INFO_PATH, '', UTF_8);
    } catch(e) {
        console.error('파일 삭제 실패', e);
    }
}

// 서버 다운 시 서버 상태 정보 변경.
const changeStateValueToKeep = function() {
    fs.writeFileSync(STATE_INFO_PATH, 'keep', UTF_8);
}

module.exports = { getServerInfo, getStateInfo, readClientsInfo, appendClientInfo, deleteClientInfo, deleteAllClientsInfo,  readLastIdInfo, writeLastIdInfo, deleteIdInfo, changeStateValueToKeep };
