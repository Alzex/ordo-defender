const { Logger } = require('tslog');

const loggers = {
    tg: new Logger({prefix: ['[TG API]'], displayDateTime: false}),
    db: new Logger({prefix: ['[DB]'], displayDateTime: false}),
    redis: new Logger({prefix: ['[REDIS]'], displayDateTime: false})
}

module.exports = loggers;
