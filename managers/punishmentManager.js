const db = require('../modules/db');
const enums = require('../data/enums');

const punishmentManagers = {
  addPunishment: (
    violatorId,
    punisherId,
    chatID,
    reasonText = null,
    type = enums.PUNISHMENT.WARN,
  ) => {
    const punish = db.punishment.create({
      data: {
        violator_id: violatorId,
        issuer_id: punisherId,
        from_chat_id: chatID,
        reason: reasonText,
        type: type,
      },
    });

    return punish;
  },
  getValidUsersPunishmentsFromChat: (
    userId,
    chatId,
    type = enums.PUNISHMENT.WARN,
  ) => {
    const punish = db.punishment.findMany({
      where: {
        violator_id: userId,
        from_chat_id: chatId,
        type: type,
        disposed_at: null,
      },
      orderBy: {
        issued_at: 'desc',
      },
    });

    return punish;
  },
  disposeEarliestPunishment: (
    userId,
    chatId,
    issuerId = null,
    type = enums.PUNISHMENT.WARN,
  ) => {
    const punish = db.$queryRaw`UPDATE defender_db.punishment SET disposed_at = CURRENT_TIMESTAMP, disposed_by = ${issuerId}
                                 WHERE violator_id = ${userId} AND from_chat_id = ${chatId} AND type = ${type} AND disposed_at IS NULL
                                     ORDER BY issued_at LIMIT 1`;
    return punish;
  },
  getAllPunishments: (userId, chatId) => {
    const punish = db.punishment.findMany({
      where: {
        violator_id: userId,
        from_chat_id: chatId,
      },
    });

    return punish;
  },
  getPunishments(userId, chatId, offset = 0, limit = 5, forChat = false) {
    if (forChat) {
      const punish = db.punishment.findMany({
        where: {
          from_chat_id: chatId,
        },
        orderBy: {
          issued_at: 'desc',
        },
        skip: offset,
        take: limit,
      });
      return punish;
    }

    const punish = db.punishment.findMany({
      where: {
        violator_id: userId,
        from_chat_id: chatId,
      },
      orderBy: {
        issued_at: 'desc',
      },
      skip: offset,
      take: limit,
    });

    return punish;
  },
  countAllPunishments(userId, chatId, forChat = false) {
    if (forChat) {
      const count = db.punishment.count({
        where: {
          from_chat_id: chatId,
        },
      });
      return count;
    }

    const count = db.punishment.count({
      where: {
        violator_id: userId,
        from_chat_id: chatId,
      },
    });

    return count;
  },
  disposeOutdated(userId, chatId, days = 7) {
    const ds = db.$queryRaw`UPDATE punishment SET disposed_at = NOW() WHERE violator_id = ${userId} AND from_chat_id = ${chatId} AND type = ${enums.PUNISHMENT.WARN} AND DATEDIFF(NOW(), issued_at) >= ${days}`;
    return ds;
  },
};

module.exports = punishmentManagers;
