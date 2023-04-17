const config = require('../data/config');
const Sentry = require('@sentry/node');
const { Logger } = require('tslog');

Sentry.init({
  dsn: config.SENTRY,
  tracesSampleRate: 1.0,
});

const errorHandler = {
  async onError(ctx, next) {
    try {
      ctx.state.log = new Logger();
      await next();
    } catch (e) {
      try {
        Sentry.captureException(e);
      } catch (e) {
        new Logger({ name: 'SENTRY' }).error(e);
      }
      const log = new Logger({ name: 'TG API' });
      await ctx.reply('Что-то пошло не так... (>_<)').catch((e) => {
        log.fatal(e.message);
      });

      let text = ctx.message?.text;

      if (ctx.update.callback_query) {
        text = ctx.update.callback_query.data;
      }
      const message = e.message.replaceAll(/[<>]+/g, '?');
      await ctx.telegram
        .sendMessage(
          config.ERROR_CHAT,
          `<b>SYSTEM BUG REPORTℹ️</b>\n\n<b>Execution query:</b>\n${text}\n\n<b>Error message:</b>\n${message}\n\n<b>Stack:</b>\n${e.stack}`,
          { parse_mode: 'HTML' },
        )
        .catch((e) => {
          log.fatal(e.message);
        });
    }
  },
};

module.exports = errorHandler;
