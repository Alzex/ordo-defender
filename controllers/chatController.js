const chatManagers = require('../managers/chatManagers');
const cacheHelper = require('../helpers/cacheHelper');
const translateHelper = require('../helpers/translateHelper');
const config = require('../data/config');
const logger = require('../modules/logger');

const chatController = {
    processMembership: async (ctx) => {
        const membershipStatus = ctx.myChatMember.new_chat_member.status;
        if (membershipStatus === 'left') return;
        if (membershipStatus === 'member' || membershipStatus === 'administrator') {
            const chat = await chatManagers.getChat(ctx.chat.id).catch((e) => {
                logger.db.fatal(e.message);
                throw e;
            });

            if (!chat) await chatManagers.addChat(ctx.chat.id).catch((e) => {
                logger.db.fatal(e.message);
                throw e;
            });
        }
    },
    processNewUsers: async (ctx) => {
        const newMember = ctx.update.message.new_chat_member;
        const strictKey = cacheHelper.genKey('strictModeration', ctx.chat.id, newMember.id);

        await cacheHelper.set(strictKey, config.STRICT_MODE_TTL).catch((e) => {
            logger.redis.error(e.message);
        });

       if (ctx.chat.id === parseInt(config.HARMONY_ID, 10)) {
            const text = translateHelper.parseNames('<b>Добро пожаловать в Гармонию Тейвата</b>, {user}!\n\n' +
              'Мы приветсвуем тебя в чате и желаем тебе приятно провести время в чате\n\n' +
              '🛂 Я - бот, который следит за порядком в чате. Поэтому сразу <i>настоятельно рекомендую</i> тебе прочесть <b><a href="https://telegra.ph/Pravila-Genshin-Gacha-Chat-06-02">правила</a></b> нашего чата. ' +
              'Если не будешь их соблюдать, то пеняй на себя.\n\n' +
              '👀 <b>Кроме того тебе может быть интересно:</b>\n\n' +
              '🔶 <b><a href="https://t.me/harmony_of_teyvat">Наш канал</a></b> \n' +
              '🔶 <b><a href="https://t.me/milvachatbot">Бот-симулятор молитв</a></b>\n\n' +
              '🤗 <i>Я и администрация приветствуем тебя и желаем приятно провести время в чате</i>', ctx.from);
            await ctx.replyWithHTML(text, { disable_web_page_preview: true });
        }
    }
}

module.exports = chatController;