'use strict';

class Chat{
    static INFO_TYPE = Object.freeze({
        checkDuplicatedNick: 'checkDuplicatedNick',
        message: 'message',
        inform: 'inform',
        requestClientSocketInfoWithId: 'requestClientSocketInfoWithId',
        requestClientSocketInfo: 'requestClientSocketInfo',
        responseClientSocketInfoWithId: 'responseClientSocketInfoWithId',
        responseClientSocketInfo: 'responseClientSocketInfo',
    });

    /**
     * @param {number} id 
     * @param {string} nick 
     * @param {string} message 
     * @param {string} infoType 
     * @param {number} destinationPort - 서버가 클라이언트 소켓으로부터 받은 소켓 정보를 클라이언트에게 알려주기 위한 인자.
     * @param {string} destinationHost - 서버가 클라이언트 소켓으로부터 받은 소켓 정보를 클라이언트에게 알려주기 위한 인자.
     */
    constructor(id, nick, message, infoType, destinationPort, destinationHost){
        this.id = id;
        this.nick = nick;
        this.message = message;
        this.infoType = infoType;
        this.destinationPort = destinationPort;
        this.destinationHost = destinationHost;
    }
}

module.exports = Chat;