const translate = require('../data/translate');
const messagesHelper = require('../helpers/messagesHelper');
const cacheHelper = require('../helpers/cacheHelper');

const messagesMiddleware = {
    isReply: async (ctx, next) => {
        if (!ctx.message.reply_to_message) {
            const trans = translate.getTranslate(ctx.from.language_code);
            const text = trans.errors.notAReply;
            await ctx.reply(text, {parse_mode: 'HTML'});
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
    isFirstAndWithoutLink: async (ctx, next) => {
        const isFirst = await messagesHelper.isFirst(ctx);
        const key = `firstMsgFiltration:${ctx.chat.id}:${ctx.from.id}`;

        if (messagesHelper.containsLink(ctx) && isFirst === '') {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
            await ctx.telegram.banChatMember(ctx.chat.id, ctx.from.id);
            return null;
        } else if (isFirst === '') {
            await cacheHelper.del(key);
        }

        await next();
    }
}

module.exports = messagesMiddleware;
