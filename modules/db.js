const { PrismaClient } = require('@prisma/client');
const config = require('../data/config');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: config.db.URL
        }
    }
});

module.exports = prisma;
