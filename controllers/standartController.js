const translateData = require('../data/translate');
const translateHelper = require('../helpers/translateHelper');
const chatManagers = require('../managers/chatManagers');
const cacheHelper = require('../helpers/cacheHelper');

const standartController = {
    start: async (ctx) => {
        const userLangCode = ctx.from.language_code;
        const rawText = translateData.getTranslate(userLangCode).commands.start;
        const text = translateHelper.parseNames(rawText, ctx.from);
        if (ctx.chat.type !== 'private') {
            const chatsQuery = await chatManagers.getChat(ctx.chat.id);
            if (!chatsQuery[0]) {
                await chatManagers.addChat(ctx.chat.id);
            }
        }
        await ctx.reply(text, {parse_mode: 'HTML'});
    }
}

module.exports = standartController;
