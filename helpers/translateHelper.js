const translateHelper = {
    parseNames: (text, user, mention = true) => {
        return text.replaceAll('{user}',
          mention ?
            `<b><a href="tg://user?id=${user.id}">${user.first_name}</a></b>` :
            `<b>${user.first_name}</b>`
        );
    },
    multiParseNames: (text, ...users) => {
        if (!text) {
            return 'TextError';
        }
        let txt = text;
        for (const user of users) {
            txt = txt.replace(`{user${users.indexOf(user)}}`, `<b><a href="tg://user?id=${user.id}">${user.first_name}</a></b>`);
        }
        return txt;
    },
}

module.exports = translateHelper;
