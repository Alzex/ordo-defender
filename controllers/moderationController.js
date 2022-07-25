const translate = require('../data/translate');
const translateHelper = require('../helpers/translateHelper');
const userHelper = require('../helpers/userHelper');
const punishmentManagers = require('../managers/punishmentManager');
const chatManagers = require('../managers/chatManagers');
const keyboards = require('../data/keyboards');
const enums = require('../data/enums');
const moment = require('moment');
const logger = require("../modules/logger");

const moderationController = {
    warn: async (ctx) => {
        const args = ctx.message.text.split(' ');
        const reason = ctx.message.text.substring(args[0].length);
        await userHelper.warn(ctx.telegram, ctx.message.reply_to_message.from, ctx.from, ctx.chat, ctx.state.langCode, reason);
    },
    unwarn: async (ctx) => {
        const violator = ctx.message.reply_to_message.from;
        const result = await punishmentManagers.disposeEarliestPunishment(violator.id, ctx.chat.id, ctx.from.id).catch((e) => {
            logger.db.fatal(e.message);
            throw e;
        });
        const trn = translate.get(ctx.state.langCode);

        const rawText = trn.commands.unwarn;
        const text = translateHelper.multiParseNames(rawText, violator, ctx.from);
        await ctx.reply(text, {parse_mode: 'HTML'}).catch((e) => {
            logger.tg.error(e.message);
        });
    },
    mute: async (ctx) => {
        const argumentsQuery = ctx.message.text.split(' ');
        const hours = parseInt(argumentsQuery[1], 10);
        let reason = null;

        if (argumentsQuery[1]) {
            reason = ctx.message.text.substring(argumentsQuery[0].length + argumentsQuery[1].length + 2);
        }
        if (isNaN(hours) || hours < 1) {
            const text = translate.get(ctx.state.langCode).errors.muteArgNaN;

            await ctx.reply(text, {parse_mode: 'HTML'}).catch((e) => {
                logger.tg.error(e.message);
            });
            return;
        }

        const violator = ctx.message.reply_to_message.from;

        await userHelper.mute(ctx.telegram, ctx.chat, violator, ctx.from, hours, ctx.state.langCode,reason).catch((e) => {
            logger.tg.fatal(e.message);
            throw e;
        });
    },
    unmute: async (ctx) => {
        await userHelper.unmute(ctx.telegram, ctx.chat, ctx.message.reply_to_message.from, ctx.from, ctx.state.langCode);
    },
    kick: async (ctx) => {
        const violator = ctx.message.reply_to_message.from;
        const args = ctx.message.text.split(' ');
        const reasonText = ctx.message.text.substring(args[0].length + 1);
        const reason = reasonText ? reasonText : null;

        await userHelper.kick(ctx.telegram, violator, ctx.from, ctx.chat, ctx.state.langCode, reason);
    },
    ban: async (ctx) => {
        const violator = ctx.message.reply_to_message.from;
        const args = ctx.message.text.split(' ');
        const reasonText = ctx.message.text.substring(args[0].length + 1);
        const reason = reasonText ? reasonText : null;

        await userHelper.ban(ctx.telegram, violator, ctx.from, ctx.chat, ctx.state.langCode, reason);
    },
    history: async (ctx) => {
        const arg = ctx.update.callback_query.data.split('/')[1];
        const forChat = arg.includes('chat');

        const amount = await punishmentManagers.countAllPunishments(ctx.from.id, ctx.chat.id, forChat);
        const tr = translate.get(ctx.state.langCode);
        let text = tr.commands.chatHistory;
        text = text.replace('{name}', ctx.chat.title);
        if (!forChat) {
            text = tr.commands.history;
            text = translateHelper.parseNames(text, ctx.from);
        }

        let punishments = null;
        let markup = null;
        let maxPages = null;
        let curPage = null;

        if (amount === 0) {
            text += '<i>Пусто</i>';

            await ctx.editMessageText(text, {parse_mode: 'HTML', ...keyboards.backKeyboard(ctx.state.langCode, ctx.from.id)}).catch((e) => {
                logger.tg.fatal(e.message);
                throw e;
            });

            return;
        } else if (amount <= 5) {

            punishments = await punishmentManagers.getPunishments(ctx.from.id, ctx.chat.id, 0, 5, forChat).catch((e) => {
                logger.db.fatal(e.message);
                throw e;
            });

            markup = keyboards.backKeyboard(ctx.state.langCode, ctx.from.id, forChat);
        } else {
            maxPages = Math.ceil(amount / 5);
            const args = ctx.update.callback_query.data.split(':');
            const mainAction = args[0];
            const pg = args[2];
            if (mainAction === 'history/user' || mainAction === 'history/chat') {
                curPage = 0;
            } else {
                const action = mainAction.split('/');
                const cur = parseInt(pg);
                if (action?.[2] === 'next') {
                    curPage = cur + 1;
                } else {
                    curPage = cur - 1;
                }
            }

            punishments = await punishmentManagers.getPunishments(ctx.from.id, ctx.chat.id, curPage * 5, 5, forChat).catch((e) => {
                logger.db.fatal(e.message);
                throw e;
            });
            markup = keyboards.pagesKeyboard(curPage === 0, curPage + 1 === maxPages, curPage, ctx.from.id,forChat ? 'chat' : 'user', ctx.state.langCode, forChat);
        }

        for (const punishment of punishments) {

            const issuer = await ctx.telegram.getChatMember(ctx.chat.id, Number(punishment.issuer_id)).catch((e) => {
                console.error(`[TG API ERROR] moderationController history  ctx.telegram.getChatMember:`, e.message);
            }).catch((e) => {
                if (e.error_code === 400) {
                    text = text.replaceAll('{user}', '<b>DELETED</b>');
                    return;
                }
                logger.tg.fatal(e.message);
                throw e;
            });

            text += tr.entities.punishWarn;
            text = translateHelper.parseNames(text, issuer.user);
            if (forChat) {
                const violator = await ctx.telegram.getChatMember(ctx.chat.id, Number(punishment.violator_id)).catch((e) => {
                    if (e.error_code === 400) {
                        text = text.replaceAll('{user}', '<b>DELETED</b>');
                        return;
                    }
                });
                text += tr.entities.violator;
                text = translateHelper.parseNames(text, violator.user);
            }

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

        await ctx.editMessageText(text, {parse_mode: 'HTML', ...markup}).catch((e) => {
            logger.tg.fatal(e.message);
            throw e;
        });

        await ctx.answerCbQuery().catch((e) => {
            logger.tg.error(e.message);
        });
    }
}

module.exports = moderationController;
