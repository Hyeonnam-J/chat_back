'use strict';

const executeExceptionHandler = function(){
    process.on('uncaughtException', e => {
        console.error('uncaughtException: ', e);
    });
}

module.exports = { executeExceptionHandler };