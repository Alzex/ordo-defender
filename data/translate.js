const ru = require('./translates/ru.json');
const en = require('./translates/en.json');
const uk = require('./translates/uk.json');

const translates = { ru, en, uk };

const translateData = {
  get(code) {
    if (!code) return translates.ru;
    return Object.keys(translates).includes(code)
      ? translates[code]
      : translates.ru;
  },
};

module.exports = translateData;
