const translate = require('../data/translate');
const translateHelper = require('../helpers/translateHelper');
const userHelper = require('../helpers/userHelper');
const punishmentManagers = require('../managers/punishmentManager');
const chatManagers = require('../managers/chatManagers');
const keyboards = require('../data/keyboards');
const enums = require('../data/enums');
const moment = require('moment');

const moderationController = {
    warn: async (ctx) => {
        const trn = translate.get(ctx.state.langCode);
        const rawText = trn.commands.warn;
        const issuer = ctx.from;
        const violator = ctx.message.reply_to_message.from;
        const argumentQuery = ctx.message.text.split(' ');
        const reasonText = ctx.message.text.substring(argumentQuery[0].length + 1);
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
        const trn = translate.get(ctx.state.langCode);

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
        const hours = parseInt(argumentsQuery[1], 10);
        const reason = ctx.message.text.substring(argumentsQuery[0].length + argumentsQuery[1].length + 2);
        if (isNaN(hours) || hours < 1) {
            const text = translate.get(ctx.state.langCode).errors.muteArgNaN;

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

        let text = translate.get(ctx.state.langCode).commands.mute;
        text = translateHelper.multiParseNames(text, violator, ctx.from);
        text = text.replace('{duration}', hours);

        await punishmentManagers.addPunishment(violator.id, ctx.from.id, ctx.chat.id, reason ? reason : null, enums.PUNISHMENT.MUTE);

        await ctx.reply(text, {parse_mode: 'HTML'});
    },
    unmute: async (ctx) => {
        const violator = ctx.message.reply_to_message.from;

        let text = translate.get(ctx.state.langCode).commands.unmute;
        text = translateHelper.multiParseNames(text, violator, ctx.from);

        await userHelper.unmute(ctx.telegram, ctx.chat, violator);

        await ctx.reply(text, {parse_mode: 'HTML'});
    },
    kick: async (ctx) => {
        const violator = ctx.message.reply_to_message.from;
        const tr = translate.get(ctx.state.langCode);
        const args = ctx.message.text.split(' ');
        const reasonText = ctx.message.text.substring(args[0].length + 1);
        const reason = reasonText ? reasonText : null;
        let text = tr.commands.kick;

        text = translateHelper.multiParseNames(text, violator, ctx.from);
        text = text.replace('{reason}', reason ? reason : tr.reasonNotSpecified);

        //await userHelper.kick(ctx.telegram, ctx.chat, violator);
        await punishmentManagers.addPunishment(violator.id, ctx.from.id, ctx.chat.id, reason, enums.PUNISHMENT.KICK);
        await ctx.reply(text, {parse_mode: 'HTML'});
    },
    ban: async (ctx) => {
        const violator = ctx.message.reply_to_message.from;
        const tr = translate.get(ctx.state.langCode);
        const args = ctx.message.text.split(' ');
        const reasonText = ctx.message.text.substring(args[0].length + 1);
        const reason = reasonText ? reasonText : null;
        let text = tr.commands.ban;

        text = translateHelper.multiParseNames(text, violator, ctx.from);
        text = text.replace('{reason}', reason ? reason : tr.reasonNotSpecified);

        //await ctx.telegram.banChatMember(ctx.chat.id, violator.id);
        await punishmentManagers.addPunishment(violator.id, ctx.from.id, ctx.chat.id, null, enums.PUNISHMENT.BAN);
        await ctx.reply(text, {parse_mode: 'HTML'});
    },
    history: async (ctx) => {
        const punishAmount = await punishmentManagers.countAllPunishments(ctx.from.id, ctx.chat.id);
        const amount = Number(punishAmount[0].amount);
        let text = translate.get(ctx.state.langCode).commands.history;
        text = translateHelper.parseNames(text, ctx.from);

        let punishments = null;
        let markup = null;
        let maxPages = null;
        let curPage = null;

        if (amount === 0) {
            text += '<i>Пусто</i>';
            await ctx.editMessageText(text, {parse_mode: 'HTML', ...keyboards.backKeyboard(ctx.state.langCode, ctx.from.id)});
            return;
        } else if (amount <= 5) {
            punishments = await punishmentManagers.getPunishments(ctx.from.id, ctx.chat.id);
            markup = keyboards.backKeyboard(ctx.state.langCode, ctx.from.id);
        } else {
            maxPages = Math.ceil(amount / 5);
            const args = ctx.update.callback_query.data.split(':');
            const mainAction = args[0];
            const pg = args[2];
            if (mainAction === 'history') {
                curPage = 0;
            } else {
                const action = mainAction.split('/');
                const cur = parseInt(pg);
                if (action?.[1] === 'next') {
                    curPage = cur + 1;
                } else {
                    curPage = cur - 1;
                }
            }

            punishments = await punishmentManagers.getPunishments(ctx.from.id, ctx.chat.id, curPage * 5);
            markup = keyboards.pagesKeyboard(curPage === 0, curPage + 1 === maxPages, curPage, ctx.from.id, ctx.state.langCode);
        }

        const tr = translate.get(ctx.state.langCode);


        for (const punishment of punishments) {
            const issuer = await ctx.telegram.getChatMember(ctx.chat.id, Number(punishment.issuer_id)).catch((e) => {
                console.error(`[TG API ERROR] moderationController history  ctx.telegram.getChatMember:`, e.message);
            });
            text += tr.entities.punishWarn;
            text = translateHelper.parseNames(text, issuer.user);
            text = text.replace('{type}', tr.typeToText[punishment.type.toString()]);
            text = text.replace('{date}', moment(punishment.issued_at).format('DD.MM.YYYY HH:mm:ss'));
            let valid = punishment.disposed_at && punishment.disposed_by ? tr.entities.warnDisposed : tr.entities.warnExpired;
            valid = punishment.disposed_at ? valid : tr.entities.warnValid;
            const reason = punishment.reason ? punishment.reason : tr.reasonNotSpecified;
            text = text.replace('{reason}', reason);
            if (punishment.type === enums.PUNISHMENT.WARN) {
                text += tr.entities.stateWarn;
                text = text.replace('{state}', valid);
            }
            text += '\n\n';
        }
        if (amount > 5) {
            text += tr.entities.pages;
            text = text.replace('{curP}', curPage + 1);
            text = text.replace('{maxP}', maxPages);
        }

        await ctx.editMessageText(text, {parse_mode: 'HTML', ...markup});
        await ctx.answerCbQuery();
    }
}

module.exports = moderationController;
