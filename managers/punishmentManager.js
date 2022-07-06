const db = require('../modules/db');

const punishmentManagers = {
    addPunishment: (violatorId, punisherId, chatID, reasonText = null) => {
        const reason = reasonText ? `'${reasonText}'` : 'NULL';
        const punish = db.query(`INSERT INTO punishment(violator_id, issuer_id, from_chat_id, reason) VALUES (${violatorId}, ${punisherId}, ${chatID}, ${reason})`);
        return punish;
    },
    getValidUsersPunishmentsFromChat: (userId, chatId) => {
        const punish = db.query(`SELECT * FROM punishment WHERE violator_id = ${userId} AND from_chat_id = ${chatId} AND disposed_at IS NULL`);
        return punish;
    },
    disposeEarliestPunishment: (userId, chatId, issuerId = null) => {
        const punish = db.query(`UPDATE defender_db.punishment SET disposed_at = CURRENT_TIMESTAMP, disposed_by = ${issuerId}
                                 WHERE violator_id = ${userId} AND from_chat_id = ${chatId} AND disposed_at IS NULL
                                     ORDER BY issued_at LIMIT 1`);
        return punish;
    }
}

module.exports = punishmentManagers;
