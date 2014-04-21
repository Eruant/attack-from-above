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

    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(20, 'game_sprites', 1);
    this.bullets.setAll('checkWorldBounds', true);
    this.bullets.setAll('outOfBoundsKill', true);

    this.enemys = game.add.group();
    this.enemys.enableBody = true;
    this.enemys.physicsBodyType = Phaser.Physics.ARCADE;

    this.enemys.createMultiple(10, 'game_sprites', 1);
    this.enemys.setAll('checkWorldBounds', true);
    this.enemys.setAll('outOfBoundsKill', true);

    this.keys = game.input.keyboard.createCursorKeys();
    this.input.onDown.add(this.shoot, this);

    this.enemyTimer = game.time.events.loop(500, this.addEnemy, this);

    this.score = 0;
    this.style = {
      font: '30px Arial',
      fill: '#fff',
      align: 'center'
    };
    this.labelScore = game.add.text(game.world.centerX, 20, "0", this.style);

    this.wave = new Wave(0); // send in previous wave
    this.currentWave = 1;

    this.infoLabel = game.add.text(game.world.centerX, game.world.centerY - 15, "Wave: 1", this.style);
    this.infoLabel.anchor.set(0.5, 0);
    game.time.events.add(1000, this.removeInfoLabel, this);
  },

  update: function () {
    if (this.player.inWorld === false) {
      this.restartGame();
    }

    if (this.player.body.position.x < 0 || this.player.body.position.x > 290) {
      this.player.body.velocity.x = -(this.player.body.velocity.x * 0.5);
    }

    game.physics.arcade.overlap(this.player, this.enemys, this.restartGame, null, this);
    game.physics.arcade.overlap(this.bullets, this.enemys, this.distroyEnemy, null, this);

    this.labelScore.setText("" + this.score);

    if (this.keys.left.isDown) {
      this.player.body.velocity.x -= 10;
    }

    if (this.keys.right.isDown) {
      this.player.body.velocity.x += 10;
    }

    if (!this.wave.complete && this.wave.enemiesInWave === 0) {
      this.waveComplete();
    }

  },

  distroyEnemy: function (bullet, enemy) {
    bullet.kill();
    enemy.damage(20);
    if (!enemy.alive) {
      this.score += 1;
    }
  },

  shoot: function () {
    var x, y, bullet;

    x = this.player.body.position.x;
    y = this.player.body.position.y;

    bullet = this.bullets.getFirstDead();
    if (bullet) {
      bullet.reset(x, y);
      bullet.body.velocity.y = -200;
    }
  },

  addEnemy: function () {

    var x, y, enemy;

    if (this.wave.enemiesInWave > 0) {

      x = Math.floor((Math.random() * 290) + 1);
      y = -30;

      enemy = this.enemys.getFirstDead();
      if (enemy) {
        enemy.reset(x, y);
        enemy.health = this.wave.strength;
        enemy.body.velocity.y = +200;
        this.wave.enemiesInWave -= 1;
      }

    }
  },

  enemyKilled: function () {
    this.score += 1;
  },

  waveComplete: function () {
    this.wave.complete = true;
    game.time.events.remove(this.enemyTimer);
    game.time.events.add(Phaser.Timer.SECOND * 4, this.startNewWave, this);
  },

  startNewWave: function () {
    this.wave = new Wave(this.currentWave); // send in previous wave

    this.currentWave = this.wave.currentWave;
    this.infoLabel.setText("Wave " + this.currentWave);
    this.infoLabel.alpha = 1;
    game.time.events.add(1000, this.removeInfoLabel, this);

    this.enemyTimer = game.time.events.loop(500, this.addEnemy, this);
  },

  removeInfoLabel: function () {
    this.add.tween(this.infoLabel).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
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

    game.time.events.remove(this.enemyTimer);
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
  this.complete = false;
  this.strength = this.currentWave * 4;
  if (this.strength > 100) {
    this.strength = 100;
  }

}

module.exports = Wave;

},{}]},{},[1])