const keyboards = require('../data/keyboards');

const gameController = {
  async ticTacToe(ctx) {
    await ctx.replyWithHTML('test', {
      ...keyboards.acceptTicTacToeKeyboard(ctx.from.id),
    });
  },
};

module.exports = gameController;
