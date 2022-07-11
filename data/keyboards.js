const {Markup} = require('telegraf');
const translate = require('../data/translate');

const keyboards = {
    pmKeyboard(userLangCode) {
        return new Markup.inlineKeyboard([
            new Markup.button.url(translate.get(userLangCode).keyboards.pm, 'https://t.me/ordoDefender_bot?startgroup=true')
        ])
    },
    profileKeyboard(userLangCode, userId) {
        return new Markup.inlineKeyboard([
            new Markup.button.callback(translate.get(userLangCode).keyboards.profile.history, `history:${userId}`)
        ]);

    },
    backKeyboard(userLangCode, userId) {
        return new Markup.inlineKeyboard([
            new Markup.button.callback(translate.get(userLangCode).keyboards.profile.back, `profile:${userId}`)
        ]);
    },
    pagesKeyboard(isFirst, isLast, page, userId, userLangCode) {
        const next = new Markup.button.callback('→', `history/next:${userId}:${page}`);
        const prev = new Markup.button.callback('←', `history/prev:${userId}:${page}`);
        const buttons = [[]];
        if (isFirst) {
            buttons[0].push(next);
        } else if (isLast) {
            buttons[0].push(prev)
        } else {
            buttons[0].push(prev);
            buttons[0].push(next);
        }
        buttons.push([new Markup.button.callback(translate.get(userLangCode).keyboards.profile.back, `profile:${userId}`)]);
        return new Markup.inlineKeyboard(buttons);
    },
    settingsKeyboard(userId) {
        return new Markup.inlineKeyboard([
            new Markup.button.callback('Русский', `language:${userId}:ru`),
            new Markup.button.callback('Українська 🇺🇦', `language:${userId}:uk`),
            new Markup.button.callback('English 🇬🇧', `language:${userId}:en`)
        ])
    }
}

module.exports = keyboards;
