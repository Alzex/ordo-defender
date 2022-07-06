const db = require('../modules/db');

const chatManager = {
    addChat: async (chatId) => {
        const newChat = db.query(`INSERT INTO chat (id) VALUES (${chatId})`);
        return newChat;
    },
    getChat: (chatId) => {
        const chat = db.query(`SELECT * FROM chat WHERE id = ${chatId}`);
        return chat;
    },
    updateGreet: (chatId, text) => {
        const chat = db.query(`UPDATE chat SET greeting_message = ${text} WHERE id = ${chatId}`);
        return chat;
    },
    enableGreet: (chatId, state) => {
        const chat = db.query(`UPDATE chat SET is_greet = ${state} WHERE id = ${chatId}`);
        return chat;
    }
};

module.exports = chatManager;
