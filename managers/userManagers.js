const db = require('../modules/db');

const userManagers = {
    addUser: (id, langCode = 'en') => {
        const user = db.user.create({
            data: {
                id: id,
                language_code: langCode
            }
        });

        return user;
    },
    getUser: (id) => {
        const user = db.user.findUnique({
            where: {
                id: id
            }
        });

        return user;
    },
    editLanguage(id, code) {
        const user = db.user.update({
            where: {
                id: id
            },
            data: {
                language_code: code
            }
        });

        return user;
    }
}

module.exports = userManagers;
