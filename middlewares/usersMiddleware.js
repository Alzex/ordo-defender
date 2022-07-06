const config = require('../data/config');

const usersMiddleware = {
    canReply: async (ctx, next) => {
        const receivedAt = ctx.update.message.date;
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        const gone = currentTimeInSeconds - receivedAt;

        if (gone > config.DEAD_MESSAGE_TIME) {
            return null;
        }

        await next();
    },
    isAdminOrDev: async (ctx, next) => {
        const devs = config.ADMIN_IDS;

        for (const dev of devs) {
            if (dev === ctx.from.id) {
                return await next();
            }
        }

        const chat = ctx.chat;
        const admins = await ctx.telegram.getChatAdministrators(chat.id);

        for (const admin of admins) {
            if (admin.user.id === ctx.from.id) {
                return await next();
            }
        }

        return null;
    },
    targetNotBotOrAdmin: async (ctx, next) => {
        const target = ctx.message.reply_to_message.from;
        if (target.is_bot) {
            return null;
        }
        const targetMember = await ctx.telegram.getChatMember(ctx.chat.id, target.id);
        const targetMembership = targetMember.status;

        if (targetMembership === 'administrator') {
            return null;
        }

        await next();
    }

}

module.exports = usersMiddleware;