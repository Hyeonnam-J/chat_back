'use strict';

const executeExceptionHandler = function(){
    process.on('uncaughtException', err => {
        console.log('uncaughtException: ', err);
    });
}

module.exports = { executeExceptionHandler };