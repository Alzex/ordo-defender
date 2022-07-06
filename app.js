const { Telegraf } = require('telegraf');
const commands = require('./commands/index');
const config = require('./data/config');
const events = require("./events/index");
const cache = require('./modules/cache');
const errorHandler = require('./middlewares/errorHandler')

const bot = new Telegraf(config.TOKEN, {parse_mode: 'HTML'});

bot.use(errorHandler.onError);
commands.init(bot);
events.init(bot);
cache.connect().then(() => {
    console.log('[REDIS] Connected successfully');
}).catch((e) => {
    console.error('[REDIS ERROR] Connection FAILED:', e.message);
});

bot.startPolling();
