const db = require('../modules/db');

const chatManager = {
    addChat: async (chatId) => {
        const newChat = db.chat.create({
            data: {
                id: chatId
            }
        });

        return newChat;
    },
    getChat: (chatId) => {
        const chat = db.chat.findUnique({
            where: {
                id: chatId
            }
        })
        return chat;
    },
    updateGreet: (chatId, text) => {
        const chat = db.chat.update({
            where: {
                id: chatId
            },
            data: {
                greeting_message: text
            }
        })
        return chat;
    },
    enableGreet: (chatId, state) => {
        const chat = db.chat.update({
            where: {
                id: chatId
            },
            data: {
                is_greet: state
            }
        })
        
        return chat;
    }
};

module.exports = chatManager;
