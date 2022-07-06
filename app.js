const { Telegraf } = require('telegraf');
const commands = require('./commands/index');
const config = require('./data/config');
const events = require("./events/index");
const cache = require('./modules/cache');

const bot = new Telegraf(config.TOKEN, {parse_mode: 'HTML'});

commands.init(bot);
events.init(bot);
cache.connect().then(() => {
    console.log('Redis is connected')
});

bot.startPolling();
