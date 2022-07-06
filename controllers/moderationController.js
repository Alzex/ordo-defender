const translate = require('../data/translate');
const translateHelper = require('../helpers/translateHelper');
const userHelper = require('../helpers/userHelper');
const punishmentManagers = require('../managers/punishmentManager');
const chatManagers = require('../managers/chatManagers');

const moderationController = {
    warn: async (ctx) => {
        const trn = translate.getTranslate(ctx.from.language_code);
        const rawText = trn.commands.warn;
        const issuer = ctx.from;
        const violator = ctx.message.reply_to_message.from;
        const reasonText = ctx.message.text.substring(5);
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

        const maxPunishments = chatData[0].max_warns;

        let text = translateHelper.multiParseNames(rawText, issuer, violator);
        text = text.replace('{cur}', punishments.length);
        text = text.replace('{max}', maxPunishments);
        text = text.replace('{reason}', reason ?  reasonText : trn.reasonNotSpecified);

        await ctx.reply(text, {parse_mode: 'HTML'}).catch((e) => {
            console.error(`[TG API ERROR] moderationController warn ctx.reply:`, e.message);
        });

        await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch((e) => {
            console.error(`[TG API ERROR] moderationController warn ctx.telegram.deleteMessage:`, e.message);
        });

        if (punishments.length >= chatData[0].max_warns) {
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

    },
    kick: async (ctx) => {

    },
    ban: async (ctx) => {

    }
}

module.exports = moderationController;
