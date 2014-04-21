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
