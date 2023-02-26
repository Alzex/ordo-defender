const cacheHelper = require('../helpers/cacheHelper');
const { prefix } = require('prisma/preinstall');

class Game {
  constructor(prefix, player1Id) {
    this.player1Id = player1Id;
    this.player2Id = null;
    this.key = null;
    this.prefix = prefix;
  }

  init(player2Id) {
    this.player2Id = player2Id;
    this.key = cacheHelper.genKey(
      `game-${prefix}`,
      this.player1Id,
      this.player2Id,
    );
  }
}
