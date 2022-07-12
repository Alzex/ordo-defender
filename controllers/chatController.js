const chatManagers = require('../managers/chatManagers');
const cacheHelper = require('../helpers/cacheHelper');
const config = require('../data/config');
const logger = require('../modules/logger');

const chatController = {
    processMembership: async (ctx) => {
        const membershipStatus = ctx.myChatMember.new_chat_member.status;
        if (membershipStatus === 'left') return;
        if (membershipStatus === 'member' || membershipStatus === 'administrator') {
            const chat = await chatManagers.getChat(ctx.chat.id).catch((e) => {
                logger.db.fatal(e.message);
                throw e;
            });

            if (!chat) await chatManagers.addChat(ctx.chat.id).catch((e) => {
                logger.db.fatal(e.message);
                throw e;
            });
       }
    },
    processNewUsers: async (ctx) => {
        const newMember = ctx.update.message.new_chat_member;
        const strictKey = cacheHelper.genKey('strictModeration', ctx.chat.id, newMember.id);
        const messageKey = cacheHelper.genKey('firstMsgFiltration', ctx.chat.id, newMember.id);

        await cacheHelper.set(strictKey, config.STRICT_MODE_TTL).catch((e) => {
            logger.redis.error(e.message);
        });

        await cacheHelper.set(messageKey, config.MESSAGE_MONITOR_TTL).catch((e) => {
            logger.redis.error(e.message);
        });
    }
}

module.exports = chatController;