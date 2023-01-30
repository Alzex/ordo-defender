const translateData = require('../data/translate');
const translateHelper = require('../helpers/translateHelper');
const chatManagers = require('../managers/chatManagers');
const punishmentManager = require('../managers/punishmentManager');
const userManagers = require('../managers/userManagers');
const keyboards = require('../data/keyboards');
const logger = require("../modules/logger");

const standartController = {
    start: async (ctx) => {
        const userLangCode = ctx.state.langCode;
        const rawText = translateData.get(userLangCode).commands.start;
        const text = translateHelper.parseNames(rawText, ctx.from);
        if (ctx.chat.type !== 'private') {
            const chatsQuery = await chatManagers.getChat(ctx.chat.id).catch((e) => {
                logger.db.fatal(e.message);
                throw e;
            });
            if (!chatsQuery) {
                await chatManagers.addChat(ctx.chat.id).catch((e) => {
                    logger.db.fatal(e.message);
                    throw e;
                });
            }
        }
        await ctx.reply(text, {parse_mode: 'HTML'}).catch((e) => {
            logger.tg.fatal(e.message);
            throw e;
        });
    },
    profile: async (ctx) => {
        let text = translateData.get(ctx.state.langCode).commands.profile;
        text = translateHelper.parseNames(text, ctx.from);

        const chatData = await chatManagers.getChat(ctx.chat.id).catch((e) => {
            logger.db.fatal(e.message);
            throw e;
        });

        if (!chatData) {
            await chatManagers.addChat(ctx.chat.id).catch((e) => {
                logger.db.fatal(e.message);
                throw e;
            });
        }

        const punishments = await punishmentManager.getValidUsersPunishmentsFromChat(ctx.from.id, ctx.chat.id).catch((e) => {
            logger.db.fatal(e.message);
            throw e;
        });

        const cur = punishments.length;
        const max = chatData[0] ? chatData[0].max_warns : 3;

        text = text.replace('{cur}', cur);
        text = text.replace('{max}', max);
        text = text.replace('{id}', ctx.from.id)

        if (ctx.update.callback_query) {
            await ctx.editMessageText(text, {parse_mode: 'HTML', ...keyboards.profileKeyboard(ctx.state.langCode, ctx.from.id)}).catch((e) => {
                logger.tg.fatal(e.message);
                throw e;
            });
            await ctx.answerCbQuery();
            return;
        }

        await ctx.reply(text, {parse_mode: 'HTML', ...keyboards.profileKeyboard(ctx.state.langCode, ctx.from.id)}).catch((e) => {
            logger.tg.error(e.message);
        });
    },
    async settings(ctx) {
        const langs = {
            'ru': 'Сейчас выбран: <b>русский</b>',
            'uk': 'Зараз обрана: <b>українська</b>',
            'en': 'Current language: <b>english</b>',
        }
        if (!ctx.update.callback_query) {
            await ctx.reply(langs[ctx.state.langCode], {parse_mode: 'HTML',...keyboards.settingsKeyboard(ctx.from.id)}).catch((e) => {
                logger.tg.fatal(e.message);
                throw e;
            });
            return;
        }
        const newLang = ctx.update.callback_query.data.split(':')[2];
        if (newLang === ctx.state.langCode) {
            await ctx.answerCbQuery();
            return;
        }
        ctx.state.langCode = newLang;
        await userManagers.editLanguage(ctx.from.id, newLang).catch((e) => {
            logger.db.fatal(e.message);
            throw e;
        });
        await ctx.editMessageText(langs[ctx.state.langCode], {parse_mode: 'HTML',...keyboards.settingsKeyboard(ctx.from.id)}).catch((e) => {
            logger.tg.error(e.message);
        });
    },
    async chat(ctx) {
        const tr = translateData.get(ctx.state.langCode);
        let text = tr.commands.chat;

        text = text.replace('{name}', ctx.chat.title);
        text = text.replace('{id}', ctx.chat.id);
        const count = await ctx.telegram.getChatMembersCount(ctx.chat.id);
        text = text.replace('{users}', count);

        const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);

        for (const admin of admins) {
            if (admin.status === 'creator') {
                text += tr.entities.admins.owner;
            } else {
                text += tr.entities.admins.admin;
            }
            text = translateHelper.parseNames(text, admin.user, false);
        }
        const markup = keyboards.chatKeyboard(ctx.from.id, ctx.state.langCode);

        if (ctx.update.callback_query) {
            await ctx.editMessageText(text, {parse_mode: 'HTML', ...markup}).catch((e) => {
                logger.tg.fatal(e.message);
                throw e;
            });
            await ctx.answerCbQuery();
            return;
        }

        await ctx.reply(text, {parse_mode: 'HTML', ...markup});
    }
}

module.exports = standartController;
