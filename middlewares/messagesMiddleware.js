const translate = require('../data/translate');
const messagesHelper = require('../helpers/messagesHelper');
const cacheHelper = require('../helpers/cacheHelper');
const keyboards = require('../data/keyboards');
const userHelper = require('../helpers/userHelper');
const translateHelper = require('../helpers/translateHelper');

const messagesMiddleware = {
  isReply: async (ctx, next) => {
    if (!ctx.message.reply_to_message) {
      const trans = translate.get(ctx.state.langCode);
      const text = trans.errors.notAReply;
      await ctx.reply(text, { parse_mode: 'HTML' }).catch((e) => {
        console.error(
          `[TG API ERROR] messagesMiddleware isReply ctx.reply:`,
          e.message,
        );
      });
      return null;
    }
    await next();
  },
  notFromPM: async (ctx, next) => {
    if (ctx.chat.type === 'private') {
      await ctx.reply(translate.get(ctx.state.langCode).errors.pm, {
        ...keyboards.pmKeyboard(ctx.state.langCode),
      });
      return null;
    } else if (ctx.message?.forward_from?.chat?.type === 'channel') {
      return null;
    }
    await next();
  },
  deleteCommandQuery: async (ctx, next) => {
    await ctx.telegram
      .deleteMessage(ctx.chat.id, ctx.message.message_id)
      .catch((e) => {
        console.error(
          `[TG API ERROR] messagesMiddleware deleteCommandQuery ctx.telegram.deleteMessage:`,
          e.message,
        );
      });

    await next();
  },
  isFirstAndWithoutLink: async (ctx, next) => {
    const inStrictMode = await messagesHelper.inStrictMode(ctx).catch((e) => {
      console.error(
        `[REDIS ERROR] messagesMiddleware isFirstAndWithoutLink messagesHelper.isFirst:`,
        e.message,
      );
      throw e;
    });

    if (messagesHelper.containsLink(ctx) && inStrictMode === '') {
      await ctx.telegram
        .deleteMessage(ctx.chat.id, ctx.message.message_id)
        .catch((e) => {
          console.error(
            `[TG API ERROR] messagesMiddleware isFirstAndWithoutLink ctx.telegram.deleteMessage:`,
            e.message,
          );
          throw e;
        });
      await userHelper
        .ban(
          ctx.telegram,
          ctx.from,
          ctx.botInfo,
          ctx.chat,
          ctx.state.langCode,
          'Сообщение с ссылкой\n\n<i>Режим строгой моедерации ⛔</i>',
        )
        .catch((e) => {
          console.error(
            `[TG API ERROR] messagesMiddleware isFirstAndWithoutLink ctx.telegram.banChatMember:`,
            e.message,
          );
          throw e;
        });
      return null;
    }

    await next();
  },
  async dublicateFilter(ctx, next) {
    const key = `dublicateFilter:${ctx.chat.id}:${ctx.from.id}`;
    let data = await cacheHelper.get(key);
    const msg = ctx.message;
    const ignore = ['шма рыбалка', '/wish', '/wish10'];

    if (!data) {
      if (msg.text) {
        for (const state of ignore) {
          if (ctx.message.text.toLowerCase().includes(state)) {
            await next();
            return;
          }
        }
        data = msg.text;
      } else if (msg.photo) {
        data = msg.photo[0].file_unique_id;
      } else if (msg.animation) {
        data = msg.animation.file_unique_id;
      }
      await cacheHelper.set(key, 30, {
        message: data,
        counter: 0,
        isExecuted: false,
      });
      await next();
      return;
    }
    data = JSON.parse(data);
    if (
      ctx.message.text === data.message ||
      msg.photo?.[0].file_unique_id === data.message ||
      msg.animation?.file_unique_id === data.message
    ) {
      if (data.counter === 20 && !data.isExecuted) {
        data.isExecuted = true;
        await userHelper.mute(
          ctx.telegram,
          ctx.chat,
          ctx.from,
          ctx.botInfo,
          24,
          ctx.state.langCode,
          'Массовый спам',
        );
        await cacheHelper.set(key, 30, data);
        return;
      } else {
        data.counter++;
        await cacheHelper.set(key, 30, data);
      }
      await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
      return;
    } else {
      await cacheHelper.del(key);
    }
    await next();
  },
  async stickerSpamFilter(ctx, next) {
    if (!ctx.message.sticker) {
      await next();
      return;
    }
    const key = cacheHelper.genKey('stickerFilter', ctx.chat.id, ctx.from.id);
    let data = await cacheHelper.get(key);

    if (!data) {
      data = { counter: 1 };
      await cacheHelper.set(key, 10, data);
      await next();
      return;
    }
    data = JSON.parse(data);
    if (data.counter >= 3 && data.counter < 6) {
      if (data.counter === 4) {
        let text = translate.get(ctx.state.langCode).entities.stickerWarn;
        text = translateHelper.parseNames(text, ctx.from);
        await ctx.reply(text, { parse_mode: 'HTML' });
      }
      await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
    } else if (data.counter >= 6) {
      await userHelper.mute(
        ctx.telegram,
        ctx.chat,
        ctx.from,
        ctx.botInfo,
        3,
        ctx.state.langCode,
        'Спам стикерами',
      );
      await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
      await cacheHelper.del(key);
    }
    data.counter++;
    await cacheHelper.set(key, 10, data);
    await next();
  },
};

module.exports = messagesMiddleware;
