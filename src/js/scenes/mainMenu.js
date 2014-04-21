/*globals module, require, localStorage*/

var Phaser = require('phaser'),
  game = require('../game');

module.exports = {

  create: function () {

    var tween,
      highscore = localStorage.getItem("highscore"),
      lastscore = localStorage.getItem("lastscore"),
      style = {
        font: '30px Arial',
        fill: '#fff',
        align: 'center'
      };

    if (highscore) {
      this.highscore = highscore;
    } else {
      this.highscore = 0;
    }

    this.background = this.add.sprite(0, 0, 'menu_background');
    this.background.alpha = 0;

    this.labelTitle = game.add.text(game.world.centerX, 20, "Tap to start", style);
    this.labelTitle.alpha = 0;
    this.labelTitle.anchor.set(0.5, 0);

    this.highscoreLabel = game.add.text(game.world.centerX, 430, "High Score: " + this.highscore, style);
    this.highscoreLabel.anchor.set(0.5, 0);

    if (lastscore) {
      this.lastscoreLabel = game.add.text(game.world.centerX, 390, "Last Score: " + lastscore, style);
      this.lastscoreLabel.anchor.set(0.5, 0);
    }

    tween = this.add.tween(this.background)
      .to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true);
    this.add.tween(this.labelTitle)
      .to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true);

    tween.onComplete.add(this.addPointerEvents, this);
  },

  addPointerEvents: function () {
    this.input.onDown.addOnce(this.startGame, this);
  },

  startGame: function () {
    game.state.start('level1', true, false);
  }

};
