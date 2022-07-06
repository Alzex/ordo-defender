const cache = require('../modules/cache');

const cacheHelper = {
    genKey: (type, chatId, userId) => {
      return `${type}:${chatId}:${userId}`;
    },
    set: (key, ttl, value = null) => {
        let jsonValue = '';

        if (value) {
            jsonValue = JSON.stringify(value);
        }

        return cache.set(key, jsonValue, {EX: ttl});
    },
    get: (key) => {
        return cache.get(key);
    },
    del: (key) => {
        return cache.del(key);
    },
}

module.exports = cacheHelper;
