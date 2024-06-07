'use strict';

const { logger } = require('../logger')

const executeExceptionHandler = function(){
    process.on('uncaughtException', e => {
        logger.error(`uncaughtException - ${e}`);
    });

    process.on('unhandlerRejection', e => {
        logger.error(`unhandlerRejection - ${e}`);
    });

    process.on('warning', e => {
        logger.warn(`warning - ${e}`);
    });
}

module.exports = { executeExceptionHandler };