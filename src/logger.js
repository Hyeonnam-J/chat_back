'user strict'

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, colorize } = format;
const DailyRotateFile = require('winston-daily-rotate-file');

const LOG_PATH = `logs/${getCurrentMonth()}`;

// custom log level.
const myLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        debug: 'green'
    }
};

/**
 * 로그 형식
 * 
 * @param {Object} ...metadata - 메시지 외 아이디, 닉, 어드레스, 포트 정보를 가진 Chat 객체.
 */
const myFormat = printf(({ timestamp, label, level, message, ...metadata }) => {
    let _log = `${timestamp} [${label}] (${level}) ${message}`;
    if(Object.keys(metadata).length){   // 0 이하 거짓, 1 이상 참.
        _log += ` ${JSON.stringify(metadata)}`;
    }
    return _log;
});

const logger = createLogger({
    levels: myLevels.levels,
    format: combine(
        timestamp(),
        label({ label: 'server-1' }),
        myFormat,
    ),

    transports: [
        new DailyRotateFile({
            level: 'debug',
            filename: `${LOG_PATH}/log`,
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '1095d'   // 3년 보관.
        }),
        new transports.Console({ 
            level: 'debug', 
            format: format.combine(
                colorize({colors: myLevels.colors}), 
                myFormat
            ) 
        })
    ]
});

// 년월.
function getCurrentMonth(){
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    // const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}`;
}

module.exports = logger;