'use strict';

class Chat{
    
    static INFO_TYPE = Object.freeze({
        message: 'message',
        inform: 'inform',
        requestClientSocketInfoWithId: 'requestClientSocketInfoWithId',
        requestClientSocketInfo: 'requestClientSocketInfo',
        responseClientSocketInfoWithId: 'responseClientSocketInfoWithId',
        responseClientSocketInfo: 'responseClientSocketInfo',
    });

    // static STATE = Object.freeze({
    //     normal: 'normal',
    //     abnormal_restart: 'abnormal_restart'
    // });

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