const translateHelper = require('./translateHelper');
const translate = require('../data/translate');
const logger = require('../modules/logger');
const punishmentManagers = require('../managers/punishmentManager');
const enums = require('../data/enums');
const chatManagers = require('../managers/chatManagers');

const userHelper = {
  async mute(tg, chat, violator, issuer, duration, langCode, reason) {
    const tr = translate.get(langCode);
    let text = tr.commands.mute;
    text = translateHelper.multiParseNames(text, violator, issuer);
    text = text.replace('{duration}', duration);
    text = text.replace('{reason}', reason ? reason : tr.reasonNotSpecified);

    await punishmentManagers.addPunishment(
      violator.id,
      issuer.id,
      chat.id,
      reason ? reason : null,
      enums.PUNISHMENT.MUTE,
    );

    await tg.sendMessage(chat.id, text, { parse_mode: 'HTML' }).catch((e) => {
      logger.tg.error(e.message);
    });
    const now = Math.floor(Date.now() / 1000);
    const until = now + duration * 60 * 60;

    await tg.restrictChatMember(chat.id, violator.id, {
      permissions: {
        can_send_messages: false,
      },
      until_date: until,
    });
  },
  async unmute(tg, chat, violator, issuer, langCode) {
    let text = translate.get(langCode).commands.unmute;
    text = translateHelper.multiParseNames(text, violator, issuer);
    await tg.restrictChatMember(chat.id, violator.id, {
      permissions: {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_add_web_page_previews: true,
        can_send_other_messages: true,
      },
    });
    await tg.sendMessage(chat.id, text, { parse_mode: 'HTML' }).catch((e) => {
      logger.tg.fatal(e.message);
      throw e;
    });
  },
  async kick(tg, violator, issuer, chat, langCode, reason) {
    const tr = translate.get(langCode);
    const untilMs = Date.now() + 60 * 1000;
    const msInSeconds = 1000;
    const until = Math.floor(untilMs / msInSeconds);

    let text = tr.commands.kick;

    text = translateHelper.multiParseNames(text, violator, issuer);
    text = text.replace('{reason}', reason ? reason : tr.reasonNotSpecified);

    await punishmentManagers
      .addPunishment(
        violator.id,
        issuer.id,
        chat.id,
        reason,
        enums.PUNISHMENT.KICK,
      )
      .catch((e) => {
        logger.db.error(e.message);
      });

    await tg.banChatMember(chat.id, violator.id, until);

    await tg.sendMessage(chat.id, text, { parse_mode: 'HTML' }).catch((e) => {
      logger.tg.error(e.message);
    });
  },
  async ban(tg, violator, issuer, chat, langCode, reason) {
    const tr = translate.get(langCode);
    let text = tr.commands.ban;

    text = translateHelper.multiParseNames(text, violator, issuer);
    text = text.replace('{reason}', !reason ? tr.reasonNotSpecified : reason);

    await tg
      .banChatMember(chat.id, violator.id, { revoke_messages: true })
      .catch((e) => {
        logger.tg.fatal(e.message);
        throw e;
      });

    await punishmentManagers
      .addPunishment(
        violator.id,
        issuer.id,
        chat.id,
        null,
        enums.PUNISHMENT.BAN,
      )
      .catch((e) => {
        logger.db.error(e.message);
      });

    await tg.sendMessage(chat.id, text, { parse_mode: 'HTML' }).catch((e) => {
      logger.tg.error(e.message);
    });
  },
  async warn(tg, violator, issuer, chat, langCode, reason) {
    const trn = translate.get(langCode);
    const rawText = trn.commands.warn;

    await punishmentManagers
      .addPunishment(violator.id, issuer.id, chat.id, reason)
      .catch((e) => {
        logger.db.fatal(e.message);
        throw e;
      });

    const punishments = await punishmentManagers
      .getValidUsersPunishmentsFromChat(violator.id, chat.id)
      .catch((e) => {
        logger.db.fatal(e.message);
        throw e;
      });

    const chatData = await chatManagers.getChat(chat.id).catch((e) => {
      logger.db.fatal(e.message);
      throw e;
    });

    if (!chatData) {
      await chatManagers.addChat(chat.id).catch((e) => {
        logger.db.fatal(e.message);
        throw e;
      });
    }

    const maxPunishments = chatData[0] ? chatData[0].max_warns : 3;
    console.log(reason);

    let text = translateHelper.multiParseNames(rawText, issuer, violator);
    text = text.replace('{cur}', punishments.length);
    text = text.replace('{max}', maxPunishments);
    text = text.replace('{reason}', reason ? reason : trn.reasonNotSpecified);

    await tg.sendMessage(chat.id, text, { parse_mode: 'HTML' }).catch((e) => {
      logger.tg.fatal(e.message);
      throw e;
    });

    if (punishments.length >= maxPunishments) {
      await this.ban(tg, violator, issuer, chat, langCode, 'Максимум УП');
    }
  },
};

module.exports = userHelper;
