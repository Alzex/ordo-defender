const translateHelper = {
    parseNames: (text, user) => {
        return text.replaceAll('{name}', `<b><a href="tg://user?id=${user.id}">${user.first_name}</a></b>`);
    },
    multiParseNames: (text, ...users) => {
        let txt = text;
        for (const user of users) {
            txt = txt.replace(`{user${users.indexOf(user)}}`, `<b><a href="tg://user?id=${user.id}">${user.first_name}</a></b>`);
        }
        return txt;
    },
}

module.exports = translateHelper;