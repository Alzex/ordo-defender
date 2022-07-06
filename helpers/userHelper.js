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
    }
};

module.exports = userHelper;
