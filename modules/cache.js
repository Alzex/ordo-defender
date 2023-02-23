const redis = require('redis');
const config = require('../data/config');

const client = redis.createClient({
  url: config.REDIS_URL,
});

module.exports = client;
