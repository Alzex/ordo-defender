const db = require('../modules/db');

const userManagers = {
    addUser: (id, langCode = 'en') => {
        const user = db.query(`INSERT INTO user(id, language_code) VALUES (${id}, '${langCode}')`);
        return user;
    },
    getUser: (id) => {
        const user = db.query(`SELECT * FROM user WHERE id = ${id}`);
        return user;
    },
    editLanguage(id, code) {
        const user = db.query(`UPDATE user SET language_code = '${code}' WHERE id = ${id}`);
        return user;
    }
}

module.exports = userManagers;
