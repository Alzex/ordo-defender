const chatManagers = require('../managers/chatManagers');
const cacheHelper = require('../helpers/cacheHelper');
const translateHelper = require('../helpers/translateHelper');
const config = require('../data/config');
const logger = require('../modules/logger');
const keyboards = require('../data/keyboards');

const chatController = {
  processMembership: async (ctx) => {
    const membershipStatus = ctx.myChatMember.new_chat_member.status;
    if (membershipStatus === 'left') return;
    if (membershipStatus === 'member' || membershipStatus === 'administrator') {
      const chat = await chatManagers.getChat(ctx.chat.id).catch((e) => {
        logger.db.fatal(e.message);
        throw e;
      });

      if (!chat)
        await chatManagers.addChat(ctx.chat.id).catch((e) => {
          logger.db.fatal(e.message);
          throw e;
        });
    }
  },
  processNewUsers: async (ctx) => {
    const newMember = ctx.update.message.new_chat_member;
    const strictKey = cacheHelper.genKey(
      'strictModeration',
      ctx.chat.id,
      newMember.id,
    );

    await cacheHelper.set(strictKey, config.STRICT_MODE_TTL).catch((e) => {
      logger.redis.error(e.message);
    });

    let text = '';
    let markup = {};
    if (ctx.chat.id === parseInt(config.HARMONY_ID, 10)) {
      text = translateHelper.parseNames(
        '<b>Добро пожаловать в Гармонию Тейвата</b>, {user}!\n\n' +
          '🛂 Я - бот, который следит за порядком в чате. Поэтому сразу <i>настоятельно рекомендую</i> тебе прочесть <b><a href="https://telegra.ph/Pravila-Genshin-Gacha-Chat-06-02">правила</a></b> нашего чата. ' +
          'Если не будешь их соблюдать, то пеняй на себя.\n\n' +
          '👀 <b>Кроме того тебе может быть интересно:</b>\n\n' +
          '🔶 <b><a href="https://t.me/harmony_of_teyvat">Наш канал</a></b> \n' +
          '🔶 <b><a href="https://t.me/genshinGachaSimulatorBot">Бот-симулятор молитв</a></b>\n\n' +
          '🤗 <i>Я и администрация приветствуем тебя и желаем приятно провести время в чате</i>',
        ctx.from,
      );
      markup = keyboards.harmonyWelcomeButtons();
    } else if (ctx.chat.id === parseInt(config.WISH_GROUP_ID, 10)) {
      text = translateHelper.parseNames(
        '<b>Добро пожаловать в Gacha Simulator Chat</b>, {user}!\n\n' +
          '🛂 Я - бот, который поможет тебе провести время в чате симуляции молитв из игры Genshin Impact. Если ты хочешь узнать больше о нас, можешь присоединиться к основному чату <a href="https://t.me/harmony_of_teyvat_chat"><b>тут</b></a>.\n\n' +
          '👀 Кроме того, тебе может быть интересно посетить наш <a href="https://t.me/harmony_of_teyvat"><b>канал</b></a>.\n\n' +
          '🤗 <i>Я и администрация приветствуем тебя и желаем приятно провести время в чате</i>',
        ctx.from,
      );
      markup = keyboards.gachaWelcomeButtons();
    }

    text &&
      markup &&
      (await ctx.replyWithHTML(text, {
        disable_web_page_preview: true,
        ...markup,
      }));
  },
};

module.exports = chatController;
