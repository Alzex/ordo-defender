const usersMiddleware = require('../middlewares/usersMiddleware');
const messagesMiddleware = require('../middlewares/messagesMiddleware');
const moderationController = require('../controllers/moderationController');
const standartController = require('../controllers/standartController');
const botController = require('../controllers/botController');
const chatController = require('../controllers/chatController');
const gameController = require('../controllers/gameController');

const commands = {
  init: (bot) => {
    bot
      .command(
        'start',
        usersMiddleware.canReply,
        usersMiddleware.applyLanguage,
        standartController.start,
      )
      .command(
        'help',
        usersMiddleware.canReply,
        usersMiddleware.applyLanguage,
        standartController.start,
      )
      .command(
        'settings',
        usersMiddleware.canReply,
        usersMiddleware.applyLanguage,
        standartController.settings,
      )
      .command(
        'profile',
        messagesMiddleware.notFromPM,
        usersMiddleware.canReply,
        usersMiddleware.warnsDispose,
        usersMiddleware.applyLanguage,
        standartController.profile,
      )

      //moderation
      .command(
        'warn',
        usersMiddleware.canReply,
        messagesMiddleware.notFromPM,
        usersMiddleware.botIsAdmin,
        usersMiddleware.isAdminOrDev,
        usersMiddleware.applyLanguage,
        messagesMiddleware.isReply,
        usersMiddleware.targetNotBotOrAdminOrSelf,
        messagesMiddleware.deleteCommandQuery,
        moderationController.warn,
      )
      .command(
        'unwarn',
        usersMiddleware.canReply,
        messagesMiddleware.notFromPM,
        usersMiddleware.botIsAdmin,
        usersMiddleware.isAdminOrDev,
        usersMiddleware.applyLanguage,
        messagesMiddleware.isReply,
        usersMiddleware.targetNotBotOrAdminOrSelf,
        messagesMiddleware.deleteCommandQuery,
        moderationController.unwarn,
      )
      .command(
        'mute',
        usersMiddleware.canReply,
        messagesMiddleware.notFromPM,
        usersMiddleware.botIsAdmin,
        usersMiddleware.isAdminOrDev,
        usersMiddleware.applyLanguage,
        messagesMiddleware.isReply,
        usersMiddleware.targetNotBotOrAdminOrSelf,
        messagesMiddleware.deleteCommandQuery,
        moderationController.mute,
      )
      .command(
        'unmute',
        usersMiddleware.canReply,
        messagesMiddleware.notFromPM,
        usersMiddleware.botIsAdmin,
        usersMiddleware.isAdminOrDev,
        messagesMiddleware.isReply,
        usersMiddleware.targetNotBotOrAdminOrSelf,
        messagesMiddleware.deleteCommandQuery,
        usersMiddleware.applyLanguage,
        moderationController.unmute,
      )
      .command(
        'kick',
        usersMiddleware.canReply,
        messagesMiddleware.notFromPM,
        usersMiddleware.botIsAdmin,
        usersMiddleware.isAdminOrDev,
        messagesMiddleware.isReply,
        usersMiddleware.targetNotBotOrAdminOrSelf,
        messagesMiddleware.deleteCommandQuery,
        usersMiddleware.applyLanguage,
        moderationController.kick,
      )
      .command(
        'ban',
        usersMiddleware.canReply,
        messagesMiddleware.notFromPM,
        usersMiddleware.botIsAdmin,
        usersMiddleware.isAdminOrDev,
        messagesMiddleware.isReply,
        usersMiddleware.targetNotBotOrAdminOrSelf,
        messagesMiddleware.deleteCommandQuery,
        usersMiddleware.applyLanguage,
        moderationController.ban,
      )
      .command(
        'chat',
        usersMiddleware.canReply,
        messagesMiddleware.notFromPM,
        usersMiddleware.botIsAdmin,
        usersMiddleware.isAdminOrDev,
        messagesMiddleware.deleteCommandQuery,
        usersMiddleware.applyLanguage,
        standartController.chat,
      )

      //gaming
      .command(
        'ticTacToe',
        usersMiddleware.canReply,
        messagesMiddleware.notFromPM,
        usersMiddleware.applyLanguage,
        gameController.ticTacToe,
      )

      //dev
      .command(
        'updateCommandList',
        usersMiddleware.canReply,
        usersMiddleware.isDev,
        botController.updateCommandList,
      );
  },
};

module.exports = commands;
