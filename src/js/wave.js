/*globals module*/

function Wave(previousWaveNumber) {

  this.types = 4;

  this.currentWave = previousWaveNumber + 1;
  this.enemiesInWave = this.currentWave * 3;
  this.enemyTypes = Math.ceil(Math.random() * this.types);

}

module.exports = Wave;
