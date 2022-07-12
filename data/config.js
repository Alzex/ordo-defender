const dotenv = require('dotenv');

dotenv.config();

const config = {
    TOKEN: process.env.DEFENDER_TG_BOT_API_TOKEN,
    ADMIN_IDS: [237022109],
    db: {
        ADDRESS: process.env.MYSQL_1_DEFENDER_DB_HOSTNAME,
        PORT: process.env.MYSQL_1_PORT,
        USER: process.env.MYSQL_1_USER,
        PASSWORD: process.env.MYSQL_1_PASSWORD,
        NAME: process.env.MYSQL_1_DEFENDER_DB_NAME
    },
    REDIS_URL: process.env.REDIS_URL,
    ERROR_CHAT: -1001653150520,
    DEAD_MESSAGE_TIME: 60,
    STRICT_MODE_TTL: 3600,
    MESSAGE_MONITOR_TTL: 3600 * 24 * 7,
}

module.exports = config;
