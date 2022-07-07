const config = require('../data/config');

const errorHandler = {
    onError: async (ctx, next) => {
        try {
            await next();
        } catch (e) {

            await ctx.reply('Что-то пошло не так... (>_<)').catch((e) => {
                console.error('[TG API ERROR] errorHandler onError ctx.reply:', e.message);
            });

            let text = ctx.message?.text;

            if (ctx.update.callback_query) {
                text = ctx.update.callback_query.data;
            }
            await ctx.telegram.sendMessage(config.ERROR_CHAT, `<b>SYSTEM BUG REPORTℹ️</b>\n\n<b>Execution query:</b>\n${text}\n\n<b>Error message:</b>\n${e.message}\n\n<b>Stack:</b>\n${e.stack}`, {parse_mode: 'HTML'}).catch((e) => {
                console.error('[TG API ERROR] errorHandler onError ctx.telegram.sendMessage:', e.message);
            });
        }
    }
}

module.exports = errorHandler;
