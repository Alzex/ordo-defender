const translateData = require('../data/translate');
const translateHelper = require('../helpers/translateHelper');
const chatManagers = require('../managers/chatManagers');
const punishmentManager = require('../managers/punishmentManager');
const keyboards = require('../data/keyboards');

const standartController = {
    start: async (ctx) => {
        const userLangCode = ctx.from.language_code;
        const rawText = translateData.getTranslate(userLangCode).commands.start;
        const text = translateHelper.parseNames(rawText, ctx.from);
        if (ctx.chat.type !== 'private') {
            const chatsQuery = await chatManagers.getChat(ctx.chat.id).catch((e) => {
                console.error('[DB ERROR] standartController start chatManagers.getChat:', e.message);
                throw e;
            });
            if (!chatsQuery[0]) {
                await chatManagers.addChat(ctx.chat.id).catch((e) => {
                    console.error('[DB ERROR] standartController start chatManagers.addChat:', e.message);
                    throw e;
                });
            }
        }
        await ctx.reply(text, {parse_mode: 'HTML'}).catch((e) => {
            console.error('[TG API ERROR] standartController start ctx.reply:', e.message);
            throw e;
        });
    },
    profile: async (ctx) => {
        let text = translateData.getTranslate(ctx.from.language_code).commands.profile;
        text = translateHelper.parseNames(text, ctx.from);

        const chatData = await chatManagers.getChat(ctx.chat.id).catch((e) => {
            console.error('[DB ERROR] standartController profile chatManagers.getChat:', e.message);
            throw e;
        });

        if (!chatData) {
            await chatManagers.addChat(ctx.chat.id).catch((e) => {
                console.error('[DB ERROR] standartController profile chatManagers.addChat:', e.message);
                throw e;
            });;
        }

        const punishments = await punishmentManager.getValidUsersPunishmentsFromChat(ctx.from.id, ctx.chat.id).catch((e) => {
            console.error('[DB ERROR] standartController profile punishmentManager.getValidUsersPunishmentsFromChat:', e.message);
            throw e;
        });

        const cur = punishments.length;
        const max = chatData[0] ? chatData[0].max_warns : 3;

        text = text.replace('{cur}', cur);
        text = text.replace('{max}', max);
        text = text.replace('{id}', ctx.from.id)

        await ctx.reply(text, {parse_mode: 'HTML', ...keyboards.profileKeyboard(ctx.chat.id, ctx.from.id, ctx.from.language_code)}).catch((e) => {
            console.error('[TG API ERROR] standartController profile ctx.reply:', e.message);
            throw e;
        });
    }
}

module.exports = standartController;
