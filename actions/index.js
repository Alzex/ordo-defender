const usersMiddleware = require('../middlewares/usersMiddleware');
const moderationController = require('../controllers/moderationController');
const standartController = require('../controllers/standartController');

const actions = {
    init: (bot) => {
        bot.action(/history/gm, usersMiddleware.queryLimiter, usersMiddleware.canReply, usersMiddleware.applyLanguage, moderationController.history);
        bot.action(/profile/gm, usersMiddleware.queryLimiter, usersMiddleware.canReply, usersMiddleware.applyLanguage, standartController.profile);
        bot.action(/language/gm, usersMiddleware.queryLimiter, usersMiddleware.canReply, usersMiddleware.applyLanguage, standartController.settings);
    }
}

module.exports = actions;
