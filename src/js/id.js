'use strict';

class ID { 
    static #_countId = -1;

    static getNextId(){
        return ++ID.#_countId;
    }

    static setCurrentId(id){
        ID.#_countId = id;
    }
}

module.exports = ID;