const { Telegraf } = require('telegraf');
const commands = require('./commands/index');
const config = require('./data/config');
const events = require('./events/index');
const actions = require('./actions/index');
const cache = require('./modules/cache');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./modules/logger');

const bot = new Telegraf(config.TOKEN, { parse_mode: 'HTML' });

bot.use(errorHandler.onError);
commands.init(bot);
events.init(bot);
actions.init(bot);
cache
  .connect()
  .then(() => {
    logger.redis.info('Connected successfully');
  })
  .catch((e) => {
    logger.redis.fatal('Connection FAILED:', e.message);
  });

bot.startPolling();
