const commandList = require('../data/commandList.json');
const telegraf = require('telegraf');

const botController = {
    updateCommandList: async (ctx) => {
        const adminCommands = {
            en: [],
            ru: [],
            uk: []
        };
        const publicCommands = {
            en: [],
            ru: [],
            uk: []
        };
        for (const command of commandList) {
            for (const langCode in command.description) {
                if (command.scope === 'all_chat_administrators') {
                    adminCommands[langCode].push({command: command.name, description: command.description[langCode]});
                } else {
                    adminCommands[langCode].push({command: command.name, description: command.description[langCode]});
                    publicCommands[langCode].push({command: command.name, description: command.description[langCode]});
                }
            }
        }
        for (const langCode in publicCommands) {
            if (langCode === 'en') {
                await ctx.telegram.setMyCommands(publicCommands[langCode], {scope:{type:'all_group_chats'}});
            } else {
                await ctx.telegram.setMyCommands(publicCommands[langCode], {scope:{type:'all_group_chats'}, language_code: langCode})
            }
        }
        for (const langCode in adminCommands) {
            if (langCode === 'en') {
                await ctx.telegram.setMyCommands(adminCommands[langCode], {scope:{type:'all_chat_administrators'}});
            } else {
                await ctx.telegram.setMyCommands(adminCommands[langCode], {scope:{type:'all_chat_administrators'}, language_code: langCode})
            }
        }
    }
}

module.exports = botController;
