const config = require('../data/config');

const errorHandler = {
    onError: async (ctx, next) => {
        try {
            await next();
        } catch (e) {
            await ctx.reply('Что-то пошло не так... (>_<)');
            await ctx.telegram.sendMessage(config.ERROR_CHAT, `<b>SYSTEM BUG REPORTℹ️</b>\n\n<b>Execution query:</b>\n${ctx.message.text}\n\n<b>Error message:</b>\n${e.message}\n\n<b>Stack:</b>\n${e.stack}`, {parse_mode: 'HTML'});
        }
    }
}

module.exports = errorHandler;
