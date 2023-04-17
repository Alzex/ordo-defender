const translateHelper = {
  parseNames: (text, user, mention = true) => {
    const name = user.first_name.replaceAll(/[<>]+/g, '');

    return text.replaceAll(
      '{user}',
      mention
        ? `<b><a href="tg://user?id=${user.id}">${name}</a></b>`
        : `<b>${name}</b>`,
    );
  },
  multiParseNames: (text, ...users) => {
    if (!text) {
      return 'TextError';
    }
    let txt = text;
    for (const user of users) {
      txt = txt.replace(
        `{user${users.indexOf(user)}}`,
        `<b><a href="tg://user?id=${user.id}">${user.first_name}</a></b>`,
      );
    }
    return txt;
  },
};

module.exports = translateHelper;
