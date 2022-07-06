const mariadb = require('mariadb');
const config = require('../data/config');

const pool = mariadb.createPool({
    host: config.db.ADDRESS,
    port: config.db.PORT,
    user: config.db.USER,
    password: config.db.PASSWORD,
    database: config.db.NAME
})

module.exports = pool;
