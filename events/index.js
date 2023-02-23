const chatController = require('../controllers/chatController');
const usersMiddleware = require('../middlewares/usersMiddleware');
const messagesMiddleware = require('../middlewares/messagesMiddleware');

const events = {
  init: (bot) => {
    bot
      .on(
        'my_chat_member',
        usersMiddleware.applyLanguage,
        messagesMiddleware.notFromPM,
        chatController.processMembership,
      )
      .on(
        'new_chat_member',
        usersMiddleware.applyLanguage,
        messagesMiddleware.notFromPM,
        usersMiddleware.canReply,
        chatController.processNewUsers,
      )
      .on(
        'message',
        usersMiddleware.applyLanguage,
        messagesMiddleware.notFromPM,
        usersMiddleware.botIsAdmin,
        usersMiddleware.canReply,
        usersMiddleware.whiteList,
        messagesMiddleware.isFirstAndWithoutLink,
        messagesMiddleware.stickerSpamFilter,
        messagesMiddleware.dublicateFilter,
      );
  },
};

module.exports = events;
