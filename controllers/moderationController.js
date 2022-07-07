const translate = require('../data/translate');
const translateHelper = require('../helpers/translateHelper');
const userHelper = require('../helpers/userHelper');
const punishmentManagers = require('../managers/punishmentManager');
const chatManagers = require('../managers/chatManagers');
const moment = require('moment');

const moderationController = {
    warn: async (ctx) => {
        const trn = translate.getTranslate(ctx.from.language_code);
        const rawText = trn.commands.warn;
        const issuer = ctx.from;
        const violator = ctx.message.reply_to_message.from;
        const reasonText = ctx.message.text.substring(6);
        const reason = reasonText ? reasonText : null;

        await punishmentManagers.addPunishment(violator.id, issuer.id, ctx.chat.id, reason).catch((e) => {
            console.error(`[DB ERROR] moderationController warn punishmentsManager.addPunishment:`, e.message);
            throw e;
        });

        const punishments = await punishmentManagers.getValidUsersPunishmentsFromChat(violator.id, ctx.chat.id).catch((e) => {
            console.error(`[DB ERROR] moderationController warn punishmentsManager.getValidUsersPunishmentsFromChat:`, e.message);
            throw e;
        });

        const chatData = await chatManagers.getChat(ctx.chat.id).catch((e) => {
            console.error(`[DB ERROR] moderationController warn chatManagers.getChat:`, e.message);
            throw e;
        });

        if (!chatData[0]) {
            await chatManagers.addChat(ctx.chat.id);
        }

        const maxPunishments = chatData[0] ? chatData[0].max_warns : 3;

        let text = translateHelper.multiParseNames(rawText, issuer, violator);
        text = text.replace('{cur}', punishments.length);
        text = text.replace('{max}', maxPunishments);
        text = text.replace('{reason}', reason ?  reasonText : trn.reasonNotSpecified);

        await ctx.reply(text, {parse_mode: 'HTML'}).catch((e) => {
            console.error(`[TG API ERROR] moderationController warn ctx.reply:`, e.message);
        });

        if (punishments.length >= maxPunishments) {
            const defaultDuration = chatData[0].warn_duration;
            await userHelper.mute(ctx.telegram, ctx.chat, violator, defaultDuration).catch((e) => {
                console.error(`[TG API ERROR] moderationController warn userHelper.mute:`, e.message);
                throw e;
            });
        }
    },
    unwarn: async (ctx) => {
        const violator = ctx.message.reply_to_message.from;
        const result = await punishmentManagers.disposeEarliestPunishment(violator.id, ctx.chat.id, ctx.from.id).catch((e) => {
            console.error(`[DB ERROR] moderationController unwarn punishmentManagers.disposeEarliestPunishment:`, e.message);
            throw e;
        });
        const trn = translate.getTranslate(ctx.from.language_code);

        if (result.affectedRows === 0) {
            const text = trn.errors.noWarns;
            await ctx.reply(text).catch((e) => {
                console.error(`[TG API ERROR] moderationController unwarn ctx.reply:`, e.message);
            });
            return;
        }

        const rawText = trn.commands.unwarn;
        const text = translateHelper.multiParseNames(rawText, violator, ctx.from);
        await ctx.reply(text, {parse_mode: 'HTML'}).catch((e) => {
            console.error(`[TG API ERROR] moderationController unwarn ctx.reply:`, e.message);
        });
    },
    mute: async (ctx) => {
        const argumentsQuery = ctx.message.text.split(' ');
        const hours = parseInt(argumentsQuery[1]);
        if (isNaN(hours) || hours < 1) {
            const text = translate.getTranslate(ctx.from.language_code).errors.muteArgNaN;

            await ctx.reply(text, {parse_mode: 'HTML'}).catch((e) => {
                console.error(`[TG API ERROR] moderationController mute if(isNaN) ctx.reply:`, e.message);
            });
            return;
        }

        const duration = hours * 60 * 60 * 1000;
        const violator = ctx.message.reply_to_message.from;

        await userHelper.mute(ctx.telegram, ctx.chat, violator, duration).catch((e) => {
            console.error(`[TG API ERROR] moderationController mute userHelper.mute:`, e.message);
            throw e;
        });

        let text = translate.getTranslate(ctx.from.language_code).commands.mute;
        text = translateHelper.multiParseNames(text, violator, ctx.from);
        text = text.replace('{duration}', hours);

        await ctx.reply(text, {parse_mode: 'HTML'});
    },
    unmute: async (ctx) => {
        const violator = ctx.message.reply_to_message.from;

        let text = translate.getTranslate(ctx.from.language_code).commands.unmute;
        text = translateHelper.multiParseNames(text, violator, ctx.from);

        await userHelper.unmute(ctx.telegram, ctx.chat, violator);

        await ctx.reply(text, {parse_mode: 'HTML'});
    },
    kick: async (ctx) => {

    },
    ban: async (ctx) => {

    },
    history: async (ctx) => {
        const punishments = await punishmentManagers.getAllPunishments(ctx.from.id, ctx.chat.id);
        let text = translate.getTranslate(ctx.from.language_code).commands.history;
        text = translateHelper.parseNames(text, ctx.from);

        if (punishments.length === 0) {
            text += '<i>Пусто</i>';
            await ctx.telegram.editMessageText(ctx.chat.id, ctx.update.callback_query.message.message_id , undefined, text, {parse_mode: 'HTML'});
            return;
        }

        const tr = translate.getTranslate(ctx.from.language_code);

        for (const punishment of punishments) {
            const issuer = await ctx.telegram.getChatMember(ctx.chat.id, Number(punishment.issuer_id)).catch((e) => {
                console.error(`[TG API ERROR] moderationController history  ctx.telegram.getChatMember:`, e.message);
            });
            text += tr.entities.punishWarn;
            text = translateHelper.parseNames(text, issuer.user);
            text = text.replace('{type}', tr.entities.warn)
            text = text.replace('{date}', moment(punishment.issued_at).format('DD.MM.YYYY HH:mm:ss'));
            const valid = punishment.disposed_at ? tr.entities.warnDisposed : tr.entities.warnValid;
            const reason = punishment.reason ? punishment.reason : tr.reasonNotSpecified;
            text = text.replace('{reason}', reason);
            text = text.replace('{state}', valid);
        }

        await ctx.telegram.editMessageText(ctx.chat.id, ctx.update.callback_query.message.message_id , undefined, text, {parse_mode: 'HTML'});
    }
}

module.exports = moderationController;
