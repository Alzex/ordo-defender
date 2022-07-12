const chatController = require("../controllers/chatController");
const usersMiddleware = require('../middlewares/usersMiddleware')
const messagesMiddleware = require('../middlewares/messagesMiddleware');

const events = {
    init: (bot) => {
        bot
            .on('my_chat_member', messagesMiddleware.notFromPM, chatController.processMembership)
            .on('new_chat_member',messagesMiddleware.notFromPM, usersMiddleware.canReply, chatController.processNewUsers)
            .on('message',
                messagesMiddleware.notFromPM,
                usersMiddleware.botIsAdmin,
                usersMiddleware.canReply,
                messagesMiddleware.isFirstAndWithoutLink,
                messagesMiddleware.dublicateFilter
            );
    }
}

module.exports = events;
