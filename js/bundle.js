(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @class base
 * This is the root file for the Phaser Boilerplate. All other files are included from this one.
 *
 * @author Matt Gale <matt@littleball.co.uk>
 **/

/*globals require*/


var game = require('./game'),
    boot = require('./scenes/boot.js'),
    preloader = require('./scenes/preloader'),
    mainMenu = require('./scenes/mainMenu'),
    level1 = require('./scenes/level1');

game.state.add('boot', boot, false);
game.state.add('preloader', preloader, false);
game.state.add('mainMenu', mainMenu, false);
game.state.add('level1', level1, false);

game.state.start('boot');

},{"./game":2,"./scenes/boot.js":3,"./scenes/level1":4,"./scenes/mainMenu":5,"./scenes/preloader":6}],2:[function(require,module,exports){
var Phaser = (window.Phaser);

var game = new Phaser.Game(320, 480, Phaser.AUTO, 'content', null);

module.exports = game;

},{}],3:[function(require,module,exports){
/*globals module*/

var game = require('../game');

module.exports = {

  preload: function () {

    // the preloader images
    this.load.image('loadingBar', 'assets/preloader_loading.png');

  },

  create: function () {

    // max number of fingers to detect
    this.input.maxPointers = 1;

    // auto pause if window looses focus
    this.stage.disableVisibilityChange = true;

    if (game.device.desktop) {
      this.stage.scale.pageAlignHorizontally = true;
    }

    game.state.start('preloader', true, false);
  }

};

},{"../game":2}],4:[function(require,module,exports){
/* globals module, require, localStorage*/

var Phaser = (window.Phaser),
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

},{"../game":2,"../wave":7}],5:[function(require,module,exports){
/*globals module, require, localStorage*/

var Phaser = (window.Phaser),
  game = require('../game');

module.exports = {

  create: function () {

    var tween,
      highscore = localStorage.getItem("highscore"),
      lastscore = localStorage.getItem("lastscore"),
      style = {
        font: '30px Arial',
        fill: '#fff'
      };

    if (highscore) {
      this.highscore = highscore;
    } else {
      this.highscore = 0;
    }

    this.background = this.add.sprite(0, 0, 'menu_background');
    this.background.alpha = 0;

    this.labelTitle = game.add.text(20, 20, "Tap to start", style);
    this.labelTitle.alpha = 0;

    this.highscoreLabel = game.add.text(20, 430, "High Score: " + this.highscore, style);

    if (lastscore) {
      this.lastscoreLabel = game.add.text(20, 390, "Last Score: " + lastscore, style);
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

},{"../game":2}],6:[function(require,module,exports){
/*globals module, require*/

var Phaser = (window.Phaser);

module.exports = {

  preload: function () {

    this.loadingBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loadingBar');
    this.loadingBar.anchor.x = 0.5;
    this.loadingBar.anchor.y = 0.5;
    this.load.setPreloadSprite(this.loadingBar);

    this.game.load.image('menu_background', 'assets/menu_background.png');
    this.game.load.spritesheet('game_sprites', 'assets/game_sprites.png', 32, 32);

  },

  create: function () {
    var tween = this.add.tween(this.loadingBar)
      .to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
    tween.onComplete.add(this.startMainMenu, this);
  },

  startMainMenu: function () {
    this.game.state.start('mainMenu', true, false);
  }

};

},{}],7:[function(require,module,exports){
/*globals module*/

function Wave(previousWaveNumber) {

  this.types = 4;

  this.currentWave = previousWaveNumber + 1;
  this.enemiesInWave = this.currentWave * 3;
  this.enemyTypes = Math.ceil(Math.random() * this.types);

}

module.exports = Wave;

},{}]},{},[1])