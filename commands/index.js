const usersMiddleware = require('../middlewares/usersMiddleware');
const messagesMiddleware = require('../middlewares/messagesMiddleware');
const moderationController = require('../controllers/moderationController')
const standartController = require('../controllers/standartController');

const commands = {
    init: (bot) => {
        bot
            .command('start', usersMiddleware.canReply, standartController.start)
            .command('help', usersMiddleware.canReply, standartController.start)

            //moderation
            .command('warn',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdmin,
                moderationController.warn
            )
            .command('unwarn',
            usersMiddleware.canReply,
            messagesMiddleware.notFromPM,
            usersMiddleware.isAdminOrDev,
            messagesMiddleware.isReply,
            usersMiddleware.targetNotBotOrAdmin,
            moderationController.unwarn
            )
            .command('mute',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdmin,
                moderationController.mute
            )
            .command('kick',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdmin,
                moderationController.kick
            )
            .command('ban',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdmin,
                moderationController.ban
            )
    }
}

module.exports = commands;
