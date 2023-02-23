const cacheHelper = require('./cacheHelper');

const messagesHelper = {
  containsLink: (ctx) => {
    if (ctx.message.entities) {
      for (const entity of ctx.message.entities) {
        if (entity.type === 'text_link' || entity.type === 'url') {
          return true;
        }
      }
    }
    return false;
  },
  inStrictMode: async (ctx) => {
    const key = `strictModeration:${ctx.chat.id}:${ctx.from.id}`;
    const data = await cacheHelper.get(key).catch((e) => {
      console.error(
        `[REDIS ERROR] messagesHelper isFirst cacheHelper.get`,
        e.message,
      );
      throw e;
    });
    return data;
  },
};

module.exports = messagesHelper;
