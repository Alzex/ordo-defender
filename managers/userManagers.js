const db = require('../modules/db');

const userManagers = {
    addUser: (id) => {
        const user = db.query(`INSERT INTO user VALUES (id) (${id})`);
        return user;
    },
    getUser: (id) => {
        const user = db.query(`SELECT * FROM user WHERE id = ${id}`);
        return user;
    }
}

module.exports = userManagers;
