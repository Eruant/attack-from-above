/* globals module, require, localStorage*/

var Phaser = require('phaser'),
  game = require('../game'),
  Wave = require('../wave');


module.exports = {

  create: function () {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.background = this.add.sprite(0, 0, 'menu_background');

    this.player = this.add.sprite(50, 440, 'game_sprites');

    game.physics.enable(this.player, Phaser.Physics.ARCADE);
    //this.player.body.gravity.y = 1000;

    this.blocks = game.add.group();
    this.blocks.enableBody = true;
    this.blocks.physicsBodyType = Phaser.Physics.ARCADE;

    this.blocks.createMultiple(10, 'game_sprites', 1);

    this.keys = game.input.keyboard.createCursorKeys();

    this.blockTimer = game.time.events.loop(500, this.addBlock, this);
    this.scoreTimer = game.time.events.loop(Phaser.Timer.SECOND, this.addScore, this);

    this.score = 0;
    var style = {
      font: '30px Arial',
      fill: '#fff'
    };
    this.labelScore = game.add.text(20, 20, "0", style);

    this.wave = new Wave(0); // send in previous wave
    this.currentWave = 1;
  },

  update: function () {
    if (this.player.inWorld === false) {
      this.restartGame();
    }

    if (this.player.body.position.x < 0 || this.player.body.position.x > 290) {
      this.player.body.velocity.x = -(this.player.body.velocity.x * 0.5);
    }

    game.physics.arcade.overlap(this.player, this.blocks, this.restartGame, null, this);

    this.labelScore.setText("" + this.score);

    if (this.keys.left.isDown) {
      this.player.body.velocity.x -= 10;
    }

    if (this.keys.right.isDown) {
      this.player.body.velocity.x += 10;
    }

  },

  shoot: function () {
    //this.player.body.velocity.y = -350;
  },

  addBlock: function () {

    if (this.wave.enemiesInWave > 0) {

      this.wave.enemiesInWave -= 1;

      var x = Math.floor(Math.random() * 320 + 1),
        y = -30;

      var block = this.blocks.getFirstDead();
      block.reset(x, y);
      block.body.velocity.y = +200;
      block.checkWorldBounds = true;
      block.outOfBoundsKill = true;

    } else {
      this.waveComplete();
    }
  },

  waveComplete: function () {

    // TODO add text to display wave number
    console.log('wave complete');
    game.time.events.remove(this.blockTimer);
    game.time.events.add(Phaser.Timer.SECOND * 4, this.startNewWave, this);
  },

  startNewWave: function () {
    this.wave = new Wave(this.currentWave); // send in previous wave
    this.currentWave = this.wave.currentWave;

    this.blockTimer = game.time.events.loop(500, this.addBlock, this);
  },

  addScore: function () {
    this.score += 1;
    this.labelScore.content = this.score;
  },

  restartGame: function () {

    var previousHighscore = localStorage.getItem("highscore");
    if (!previousHighscore || previousHighscore < this.score) {
      localStorage.setItem("highscore", this.score);
    }

    localStorage.setItem("lastscore", this.score);

    game.time.events.remove(this.blockTimer);
    game.time.events.remove(this.scoreTimer);
    game.state.start('mainMenu');
  }

};
