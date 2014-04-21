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
