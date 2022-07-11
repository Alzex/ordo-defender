const config = require('../data/config');
const translate = require('../data/translate')
const userManagers = require('../managers/userManagers');
const punishmentManagers = require('../managers/punishmentManager');

const usersMiddleware = {
    canReply: async (ctx, next) => {
        const receivedAt = ctx.update.callback_query ? ctx.update.callback_query.date : ctx.update.message.date;
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
                await next();
                return;
            }
        }

        const chat = ctx.chat;
        const admins = await ctx.telegram.getChatAdministrators(chat.id).catch((e) => {
            console.error('[TG API ERROR] usersMiddleware isAdminOrDev ctx.telegram.getChatAdministrators', e.message);
        });

        for (const admin of admins) {
            if (admin.user.id === ctx.from.id) {
                await next();
                return;
            }
        }
    },
    isDev: async (ctx, next) => {
        const devs = config.ADMIN_IDS;

        for (const dev of devs) {
            if (dev === ctx.from.id) {
                await next();
            }
        }
    },
    targetNotBotOrAdminOrSelf: async (ctx, next) => {
        const target = ctx.message.reply_to_message.from;

        if (target.is_bot || target.id === ctx.from.id) return null;

        const targetMember = await ctx.telegram.getChatMember(ctx.chat.id, target.id).catch((e) => {
            console.error('[TG API ERROR] usersMiddleware targetNotBotOrAdminOrSelf ctx.telegram.getChatMember:', e.message);
        });
        const targetMembership = targetMember.status;

        if (targetMembership === 'administrator') return null;

        await next();
    },
    async warnsDispose(ctx, next) {
        await punishmentManagers.disposeOutdated(ctx.from.id, ctx.chat.id);
        await next();

    },
    async queryLimiter(ctx, next) {
        const userId = ctx.update.callback_query.data.split(':')[1];
        if (ctx.from.id === parseInt(userId, 10)) {
            await next();
            return;
        }
        await ctx.answerCbQuery(translate.get(ctx.state.langCode).errors.notYourMsg);
    },
    async applyLanguage(ctx, next) {
      const userRows = await userManagers.getUser(ctx.from.id);
      if (!userRows[0]) {
          await userManagers.addUser(ctx.from.id, ctx.state.langCode);
          ctx.state.langCode = ctx.state.langCode ? ctx.state.langCode : 'en';
          await next();
          return;
      }
      const user = userRows[0];
      ctx.state.langCode = user.language_code;
      await next();
    }

}

module.exports = usersMiddleware;