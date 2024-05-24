class Chat{
    // js는 생성자를 통해 전달된 매개변수를 동적으로 선언.
    constructor(id, message, infoType, infoOrigin){
        this.id = id;
        this.message = message;
        this.infoType = infoType;
        this.infoOrigin = infoOrigin;
    }
}

Chat.infoType = Object.freeze({
    message: 'message',
    entrance: 'entrance'
});

Chat.infoOrigin = Object.freeze({
    self: 'self',
    others: 'others'
});

module.exports = Chat;