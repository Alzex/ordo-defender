const ru = require('./translates/ru.json');
const en = require('./translates/en.json');
const uk = require('./translates/uk.json');

const translates = {
    ru: ru,
    en: en,
    uk: uk
}

const translateData = {
    getTranslate: (code) => {
        return Object.keys(translates).includes(code) ? translates[code] : translates.en;
    }
}

module.exports = translateData;
