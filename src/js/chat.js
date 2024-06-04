'use strict';

class Chat{
    /**
     * 서버, 클라이언트 간 정보의 용도 식별자.
     * 
     * checkDuplicatedNick - 닉네임 체크.
     * message - 유저들 간 채팅.
     * inform - 서버 및 유저의 상태 변화 알림.
     * requestClientSocketInfoWithId - 클라이언트가 자신의 아이디와 소켓 정보 요구.
     * requestClientSocketInfo - 클라이언트가 자신의 소켓 정보 요구.
     * responseClientSocketInfoWithId - 클라이언트 아이디와 소켓 정보 응답.
     * responseClientSocketInfo - 클라이언트 소켓 정보 응답.
     */
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