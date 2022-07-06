const chatManagers = require('../managers/chatManagers');
const cacheHelper = require('../helpers/cacheHelper');
const config = require('../data/config')

const chatController = {
    processMembership: async (ctx) => {
        const membershipStatus = ctx.myChatMember.new_chat_member.status;
        if (membershipStatus === 'member' || membershipStatus === 'administrator') {
            const chat = await chatManagers.getChat(ctx.chat.id).catch((e) => {
                console.error(`[DB ERROR] chatController processMembership chatManagers.getChat:`, e.message);
                throw e;
            });

            if (!chat) await chatManagers.addChat(ctx.chat.id).catch((e) => {
                console.error(`[DB ERROR] chatController processMembership chatManagers.addChat:`, e.message);
                throw e;
            });
       }
    },
    processNewUsers: async (ctx) => {
        const newMember = ctx.update.message.new_chat_member;
        const strictKey = cacheHelper.genKey('strictModeration', ctx.chat.id, newMember.id);
        const messageKey = cacheHelper.genKey('firstMsgFiltration', ctx.chat.id, newMember.id);

        await cacheHelper.set(strictKey, config.STRICT_MODE_TTL).catch((e) => {
            console.error(`[REDIS ERROR] chatController processNewUsers cacheHelper.set:`, e.message);
            throw e;
        });

        await cacheHelper.set(messageKey, config.MESSAGE_MONITOR_TTL).catch((e) => {
            console.error(`[REDIS ERROR] chatController processNewUsers cacheHelper.set:`, e.message);
            throw e;
        });
    }
}

module.exports = chatController;