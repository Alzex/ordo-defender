const usersMiddleware = require('../middlewares/usersMiddleware');
const messagesMiddleware = require('../middlewares/messagesMiddleware');
const moderationController = require('../controllers/moderationController')
const standartController = require('../controllers/standartController');
const botController = require('../controllers/botController');

const commands = {
    init: (bot) => {
        bot
            .command('start', usersMiddleware.canReply, usersMiddleware.applyLanguage, standartController.start)
            .command('help', usersMiddleware.canReply, usersMiddleware.applyLanguage, standartController.start)
            .command('settings', usersMiddleware.canReply, usersMiddleware.applyLanguage, standartController.settings)
            .command('profile', messagesMiddleware.notFromPM, usersMiddleware.canReply, usersMiddleware.warnsDispose, usersMiddleware.applyLanguage, standartController.profile)

            //moderation
            .command('warn',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.botIsAdmin,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdminOrSelf,
                messagesMiddleware.deleteCommandQuery,
                usersMiddleware.applyLanguage,
                moderationController.warn
            )
            .command('unwarn',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.botIsAdmin,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdminOrSelf,
                messagesMiddleware.deleteCommandQuery,
                usersMiddleware.applyLanguage,
                moderationController.unwarn
            )
            .command('mute',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.botIsAdmin,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdminOrSelf,
                messagesMiddleware.deleteCommandQuery,
                usersMiddleware.applyLanguage,
                moderationController.mute
            )
            .command('unmute',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.botIsAdmin,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdminOrSelf,
                messagesMiddleware.deleteCommandQuery,
                usersMiddleware.applyLanguage,
                moderationController.unmute
            )
            .command('kick',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.botIsAdmin,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdminOrSelf,
                messagesMiddleware.deleteCommandQuery,
                usersMiddleware.applyLanguage,
                moderationController.kick
            )
            .command('ban',
                usersMiddleware.canReply,
                messagesMiddleware.notFromPM,
                usersMiddleware.botIsAdmin,
                usersMiddleware.isAdminOrDev,
                messagesMiddleware.isReply,
                usersMiddleware.targetNotBotOrAdminOrSelf,
                messagesMiddleware.deleteCommandQuery,
                usersMiddleware.applyLanguage,
                moderationController.ban
            )

            //dev
            .command('updateCommandList', usersMiddleware.canReply, usersMiddleware.isDev, botController.updateCommandList)
    }
}

module.exports = commands;
