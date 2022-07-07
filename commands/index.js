const usersMiddleware = require('../middlewares/usersMiddleware');
const messagesMiddleware = require('../middlewares/messagesMiddleware');
const moderationController = require('../controllers/moderationController')
const standartController = require('../controllers/standartController');
const botController = require('../controllers/botController');

const commands = {
    init: (bot) => {
        bot
            .command('start', usersMiddleware.canReply, standartController.start)
            .command('help', usersMiddleware.canReply, standartController.start)
            .command('profile', usersMiddleware.canReply, standartController.profile)

            //moderation
            .command('warn',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdminOrSelf,
                messagesMiddleware.deleteCommandQuery,
                moderationController.warn
            )
            .command('unwarn',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdminOrSelf,
                messagesMiddleware.deleteCommandQuery,
                moderationController.unwarn
            )
            .command('mute',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdminOrSelf,
                messagesMiddleware.deleteCommandQuery,
                moderationController.mute
            )
            .command('unmute',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdminOrSelf,
                messagesMiddleware.deleteCommandQuery,
                moderationController.unmute
            )
            .command('kick',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdminOrSelf,
                moderationController.kick
            )
            .command('ban',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdminOrSelf,
                moderationController.ban
            )

            .command('updateCommandList', usersMiddleware.canReply, usersMiddleware.isDev, botController.updateCommandList)
    }
}

module.exports = commands;
