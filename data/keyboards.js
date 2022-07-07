const {Markup} = require('telegraf');
const translate = require('../data/translate');

const keyboards = {
    profileKeyboard: (chatId, userId, userLangCode) => {
        return new Markup.inlineKeyboard([
            new Markup.button.callback(translate.getTranslate(userLangCode).keyboards.profile.history, `history:${chatId}:${userId}`)
        ]);

    }
}

module.exports = keyboards;
