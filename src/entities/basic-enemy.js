class BasicEnemy extends Enemy {
	init(x, y) {
		this.sprite = game.phaser.add.sprite(x, y, "enemy1");
		this.maxHealth = 10;

		if (this.progSvc.waveNumber <= 3) {
			this.health = 5;
			this.health += this.progSvc.waveNumber*6;
		} else if (this.progSvc.waveNumber <= 7) {
			this.health = 10;
			for(let i = 0; i < this.progSvc.waveNumber - 1; i++) {
				this.health *= 1.6;
			}
		} else {
			this.health = 10;
			for(let i = 0; i < this.progSvc.waveNumber - 1; i++) {
				this.health *= 2;
			}
		}

		this.movementAi = new FollowMovementAI(this);
		this.movementAi.speed = 4;
		this.movementAi.maxSpeed = 250;

		this.combatAi = new BasicCombatAI(this);
		this.combatAi.rateOfFire = 2000;
		this.combatAi.bulletSpeed = 300;
		this.rotHpBar = true;
	}

	postInit() {
		this.sprite.body.drag.x = 100;
		this.sprite.body.drag.y = 100;
	}
}
