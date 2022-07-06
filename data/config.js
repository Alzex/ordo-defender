const dotenv = require('dotenv');

dotenv.config();

const config = {
    TOKEN: process.env.TOKEN,
    ADMIN_IDS: [237022109],
    db: {
        ADDRESS: process.env.DB_ADDRESS,
        PORT: process.env.DB_PORT,
        USER: process.env.DB_USER,
        PASSWORD: process.env.DB_PASSWORD,
        NAME: process.env.DB_NAME
    },
    REDIS_URL: process.env.REDIS_URL,
    ERROR_CHAT: -1001653150520,
    DEAD_MESSAGE_TIME: 60,
    STRICT_MODE_TTL: 3600,
    MESSAGE_MONITOR_TTL: 3600 * 24 * 7,
}

module.exports = config;
