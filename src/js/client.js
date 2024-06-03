'use strict';

class Client {
    /**
     * 클라이언트 소켓의 상태.
     * ready -> 채팅 전 준비 단계, 이를테면 닉네임 중복체크.
     * chat -> 채팅 중.
     */
    static STATE = Object.freeze({
        ready: 'ready',
        chat: 'chat',
    })
}

module.exports = Client;