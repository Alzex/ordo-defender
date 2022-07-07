const translate = require('../data/translate');
const messagesHelper = require('../helpers/messagesHelper');
const cacheHelper = require('../helpers/cacheHelper');

const messagesMiddleware = {
    isReply: async (ctx, next) => {
        if (!ctx.message.reply_to_message) {
            const trans = translate.getTranslate(ctx.from.language_code);
            const text = trans.errors.notAReply;
            await ctx.reply(text, {parse_mode: 'HTML'}).catch((e) => {
                console.error(`[TG API ERROR] messagesMiddleware isReply ctx.reply:`, e.message);
            });
            return null;
        }
        await next();
    },
    notFromPM: async (ctx, next) => {
        if (ctx.chat.type === 'private') {
            return null;
        }
        await next();
    },
    deleteCommandQuery: async (ctx, next) => {
      await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch((e) => {
          console.error(`[TG API ERROR] messagesMiddleware deleteCommandQuery ctx.telegram.deleteMessage:`, e.message);
      });

      await next();
    },
    isFirstAndWithoutLink: async (ctx, next) => {
        const isFirst = await messagesHelper.isFirst(ctx).catch((e) => {
            console.error(`[REDIS ERROR] messagesMiddleware isFirstAndWithoutLink messagesHelper.isFirst:`, e.message);
            throw e;
        });
        const key = cacheHelper.genKey('firstMsgFiltration', ctx.chat.id, ctx.from.id);

        if (messagesHelper.containsLink(ctx) && isFirst === '') {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch((e) => {
                console.error(`[TG API ERROR] messagesMiddleware isFirstAndWithoutLink ctx.telegram.deleteMessage:`, e.message);
                throw e;
            });
            await ctx.telegram.banChatMember(ctx.chat.id, ctx.from.id).catch((e) => {
                console.error(`[TG API ERROR] messagesMiddleware isFirstAndWithoutLink ctx.telegram.banChatMember:`, e.message);
                throw e;
            });
            await cacheHelper.del(key).catch((e) => {
                console.error(`[REDIS ERROR] messagesMiddleware isFirstAndWithoutLink cacheHelper.del:`, e.message);
                throw e;
            });
            return null;
        } else if (isFirst === '') {
            await cacheHelper.del(key).catch((e) => {
                console.error(`[REDIS ERROR] messagesMiddleware isFirstAndWithoutLink cacheHelper.del:`, e.message);
                throw e;
            });
        }

        await next();
    }
}

module.exports = messagesMiddleware;
