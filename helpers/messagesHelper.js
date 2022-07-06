const cacheHelper = require('./cacheHelper')

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
    isFirst: async (ctx) => {
      const key = `firstMsgFiltration:${ctx.chat.id}:${ctx.from.id}`;
      const data = await cacheHelper.get(key);
      return data;
    }
}

module.exports = messagesHelper;
