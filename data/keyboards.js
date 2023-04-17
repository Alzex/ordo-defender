const { Markup } = require('telegraf');
const translate = require('../data/translate');

const keyboards = {
  pmKeyboard(userLangCode) {
    return new Markup.inlineKeyboard([
      new Markup.button.url(
        translate.get(userLangCode).keyboards.pm,
        'https://t.me/ordoDefender_bot?startgroup=true',
      ),
    ]);
  },
  profileKeyboard(userLangCode, userId) {
    return new Markup.inlineKeyboard([
      new Markup.button.callback(
        translate.get(userLangCode).keyboards.profile.history,
        `history/user:${userId}`,
      ),
    ]);
  },
  backKeyboard(userLangCode, userId, forChat = false) {
    if (forChat) {
      return new Markup.inlineKeyboard([
        new Markup.button.callback(
          translate.get(userLangCode).keyboards.profile.back,
          `chat:${userId}`,
        ),
      ]);
    }

    return new Markup.inlineKeyboard([
      new Markup.button.callback(
        translate.get(userLangCode).keyboards.profile.back,
        `profile:${userId}`,
      ),
    ]);
  },
  pagesKeyboard(
    isFirst,
    isLast,
    page,
    userId,
    type,
    userLangCode,
    forChat = false,
  ) {
    const next = new Markup.button.callback(
      '→',
      `history/${type}/next:${userId}:${page}`,
    );
    const prev = new Markup.button.callback(
      '←',
      `history/${type}/prev:${userId}:${page}`,
    );
    const buttons = [[]];
    if (isFirst) {
      buttons[0].push(next);
    } else if (isLast) {
      buttons[0].push(prev);
    } else {
      buttons[0].push(prev);
      buttons[0].push(next);
    }
    let backButton = new Markup.button.callback(
      translate.get(userLangCode).keyboards.profile.back,
      `profile:${userId}`,
    );
    if (forChat) {
      backButton = new Markup.button.callback(
        translate.get(userLangCode).keyboards.profile.back,
        `chat:${userId}`,
      );
    }
    buttons.push([backButton]);
    return new Markup.inlineKeyboard(buttons);
  },
  settingsKeyboard(userId) {
    return new Markup.inlineKeyboard([
      new Markup.button.callback('Русский', `language:${userId}:ru`),
      new Markup.button.callback('Українська 🇺🇦', `language:${userId}:uk`),
      new Markup.button.callback('English 🇬🇧', `language:${userId}:en`),
    ]);
  },
  chatKeyboard(userId, langCode) {
    return new Markup.inlineKeyboard([
      new Markup.button.callback(
        translate.get(langCode).keyboards.profile.moderationHistory,
        `history/chat:${userId}`,
      ),
    ]);
  },
  harmonyWelcomeButtons() {
    return new Markup.inlineKeyboard([
      [new Markup.button.url('Наш канал 🌸', 'https://t.me/harmony_of_teyvat')],
      [
        new Markup.button.url('Наш бот 😇', 'https://t.me/milvachatbot'),
        new Markup.button.url(
          'Молитвы в боте 💬',
          'https://t.me/GenshinGachaSimulator_Chat',
        ),
      ],
    ]);
  },
  gachaWelcomeButtons() {
    return new Markup.inlineKeyboard([
      [
        new Markup.button.url(
          'Наша основная группа 💬',
          'https://t.me/harmony_of_teyvat_chat',
        ),
      ],
      [new Markup.button.url('Наш канал 🌸', 'https://t.me/harmony_of_teyvat')],
    ]);
  },
};

module.exports = keyboards;
