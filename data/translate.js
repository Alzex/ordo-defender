const ru = require('./translates/ru.json');
const en = require('./translates/en.json');
const uk = require('./translates/uk.json');

const translates = {ru, en, uk};

const translateData = {
    get(code) {
        if (!code) return translates.en;
        return Object.keys(translates).includes(code) ? translates[code] : translates.en;
    }
}

module.exports = translateData;
