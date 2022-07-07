const usersMiddleware = require('../middlewares/usersMiddleware');
const moderationController = require('../controllers/moderationController');

const actions = {
    init: (bot) => {
        bot.action(/history/gm, usersMiddleware.canReply, moderationController.history);
    }
}

module.exports = actions;
