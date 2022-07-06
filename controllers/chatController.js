const chatManagers = require('../managers/chatManagers');
const cacheHelper = require('../helpers/cacheHelper');
const config = require('../data/config')

const chatController = {
    processMembership: async (ctx) => {
        const membershipStatus = ctx.myChatMember.new_chat_member.status;
        if (membershipStatus === 'member' || membershipStatus === 'administrator') {
            const chat = await chatManagers.getChatById(ctx.chat.id);

            if (!chat) await chatManagers.addChat(ctx.chat.id);
       }
    },
    processNewUsers: async (ctx) => {
        const newMember = ctx.update.message.new_chat_member;
        const strictKey = cacheHelper.genKey('strictModeration', ctx.chat.id, newMember.id);
        const messageKey = cacheHelper.genKey('firstMsgFiltration', ctx.chat.id, newMember.id);
        await cacheHelper.set(strictKey, config.STRICT_MODE_TTL);
        await cacheHelper.set(messageKey, config.MESSAGE_MONITOR_TTL);
    }
}

module.exports = chatController;