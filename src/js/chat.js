class Chat{
    // js는 생성자를 통해 전달된 매개변수를 동적으로 선언.
    constructor(id, message, infoType, issued){
        this.id = id;
        this.message = message;
        this.infoType = infoType;
        this.issued = issued;
    }
}

Chat.infoType = Object.freeze({
    message: 'message',
    alarm: 'alarm'
});

module.exports = Chat;