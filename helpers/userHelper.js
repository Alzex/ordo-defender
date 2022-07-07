const userHelper = {
    mute: (tg, chat, user, durationInMs) => {
        const untilMs = Date.now() + durationInMs;
        const msInSeconds = 1000;
        const until = Math.floor(untilMs / msInSeconds);
        return tg.restrictChatMember(chat.id, user.id, {
            permissions: {
                can_send_messages: false
            },
            until_date: until
        });
    },
    unmute: (tg, chat, user) => {
        return tg.restrictChatMember(chat.id, user.id, {
            permissions: {
                can_send_messages: true,
                can_send_media_messages: true,
                can_send_polls: true,
                can_add_web_page_previews: true,
                can_send_other_messages: true
            }
        })
    }
};

module.exports = userHelper;
