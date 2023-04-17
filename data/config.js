const dotenv = require('dotenv');

dotenv.config();

const config = {
  TOKEN: process.env.DEFENDER_TG_BOT_API_TOKEN,
  ADMIN_IDS: [237022109],
  SENTRY: process.env.SENTRY,
  db: {
    URL: process.env.DATABASE_URL,
  },
  HARMONY_ID: process.env.HARMONY_ID,
  REDIS_URL: process.env.REDIS_URL,
  ERROR_CHAT: -1001653150520,
  DEAD_MESSAGE_TIME: 60,
  STRICT_MODE_TTL: 3600,
  MESSAGE_MONITOR_TTL: 3600 * 24 * 7,
  WISH_GROUP_ID: process.env.WISH_GROUP_ID,
};

module.exports = config;
