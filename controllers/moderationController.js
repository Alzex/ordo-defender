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

        await punishmentManagers.addPunishment(violator.id, issuer.id, ctx.chat.id, reason);

        const punishments = await punishmentManagers.getValidUsersPunishmentsFromChat(violator.id, ctx.chat.id);
        const chatData = await chatManagers.getChat(ctx.chat.id);
        const maxPunishments = chatData[0].max_warns;

        let text = translateHelper.multiParseNames(rawText, issuer, violator);
        text = text.replace('{cur}', punishments.length);
        text = text.replace('{max}', maxPunishments);
        text = text.replace('{reason}', reason ?  reasonText : trn.reasonNotSpecified);

        await ctx.reply(text, {parse_mode: 'HTML'});
        await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);

        if (punishments.length >= chatData[0].max_warns) {
            const defaultDuration = chatData[0].warn_duration;
            await userHelper.mute(ctx.telegram, ctx.chat, violator, defaultDuration);
        }
    },
    unwarn: async (ctx) => {
        const violator = ctx.message.reply_to_message.from;
        const result = await punishmentManagers.disposeEarliestPunishment(violator.id, ctx.chat.id, ctx.from.id);
        const trn = translate.getTranslate(ctx.from.language_code);

        if (result.affectedRows === 0) {
            const text = trn.errors.noWarns;
            await ctx.reply(text);
            return;
        }

        const rawText = trn.commands.unwarn;
        const text = translateHelper.multiParseNames(rawText, violator, ctx.from);
        await ctx.reply(text, {parse_mode: 'HTML'});
    },
    mute: async (ctx) => {

    },
    kick: async (ctx) => {

    },
    ban: async (ctx) => {

    }
}

module.exports = moderationController;
