'use strict';

const executeExceptionHandler = function(){
    process.on('uncaughtException', e => {
        console.error('uncaughtException: ', e);
    });

    process.on('unhandlerRejection', e => {
        console.error('unhandlerRejection: ', e);
    });

    process.on('warning', e => {
        console.warn('warning: ', e);
    });
}

module.exports = { executeExceptionHandler };