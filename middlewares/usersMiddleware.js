const config = require('../data/config');
const translate = require('../data/translate');
const userManagers = require('../managers/userManagers');
const punishmentManagers = require('../managers/punishmentManager');
const logger = require('../modules/logger');

const usersMiddleware = {
  canReply: async (ctx, next) => {
    const receivedAt = ctx.update.callback_query
      ? ctx.update.callback_query.date
      : ctx.update.message.date;
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
    const admins = await ctx.telegram
      .getChatAdministrators(chat.id)
      .catch((e) => {
        logger.tg.fatal(e.message);
        throw e;
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

    if (devs.contains(ctx.from.id)) {
      return next();
    }
  },
  targetNotBotOrAdminOrSelf: async (ctx, next) => {
    const target = ctx.message.reply_to_message.from;

    if (target.is_bot || target.id === ctx.from.id) return null;

    const targetMember = await ctx.telegram
      .getChatMember(ctx.chat.id, target.id)
      .catch((e) => {
        logger.tg.fatal(e.message);
        throw e;
      });
    const targetMembership = targetMember.status;

    if (
      targetMembership === 'administrator' ||
      targetMember.status === 'creator'
    )
      return null;

    await next();
  },
  async whiteList(ctx, next) {
    const target = ctx.from;

    if (target.is_bot) return;

    const targetMember = await ctx.telegram
      .getChatMember(ctx.chat.id, target.id)
      .catch((e) => {
        logger.tg.fatal(e.message);
        throw e;
      });

    if (
      targetMember.status === 'administrator' ||
      targetMember.status === 'creator'
    ) {
      return;
    }

    await next();
  },
  async warnsDispose(ctx, next) {
    await punishmentManagers.disposeOutdated(ctx.from.id, ctx.chat.id);
    await next();
  },
  async botIsAdmin(ctx, next) {
    const self = await ctx.telegram
      .getChatMember(ctx.chat.id, ctx.botInfo.id)
      .catch((e) => {
        logger.tg.fatal(e.message);
        throw e;
      });
    if (self.status === 'administrator') {
      await next();
    }
  },
  async queryLimiter(ctx, next) {
    const userId = ctx.update.callback_query.data.split(':')[1];
    if (ctx.from.id === parseInt(userId, 10)) {
      await next();
      return;
    }
    await ctx
      .answerCbQuery(translate.get(ctx.state.langCode).errors.notYourMsg)
      .catch((e) => {
        logger.tg.error(e.message);
      });
  },
  async applyLanguage(ctx, next) {
    const userRows = await userManagers.getUser(ctx.from.id);

    if (!userRows) {
      await userManagers
        .addUser(ctx.from.id, ctx.state.langCode)
        .catch(async (e) => {
          logger.db.fatal(e.message);
          await ctx.tg.sendMessage(
            config.ERROR_CHAT,
            `DB unknown error\n\nUID: ${ctx.from.id}\nDB Data:${JSON.stringify(
              userRows || {},
            )}\nERR: ${e.message}`,
          );
        });
      ctx.state.langCode = ctx.state.langCode ? ctx.state.langCode : 'ru';
      await next();
      return;
    }
    const user = userRows;
    ctx.state.langCode = user.language_code;
    await next();
  },
};

module.exports = usersMiddleware;
