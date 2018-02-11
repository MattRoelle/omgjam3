class BouncerEnemy extends Enemy {
	init(x, y) {
		this.sprite = game.phaser.add.sprite(x, y, "bouncer");
		this.sprite.animations.add("idle", [0, 1, 2, 3, 4], 10, true);
		this.sprite.animations.play("idle");
		this.maxHealth = 50;


		if (this.progSvc.waveNumber <= 3) {
			this.health = 20;
			this.health += this.progSvc.waveNumber*5;
		} else {
			this.health = 10;
			for(let i = 0; i < this.progSvc.waveNumber - 1; i++) {
				this.health *= 1.8;
			}
		}

		this.movementAi = new MovementAI(this);

		this.combatAi = new BasicCombatAI(this);
		this.combatAi.rateOfFire = 2000;
		this.combatAi.bulletSpeed = 300;
		this.rotHpBar = false;
	}

	postInit() {
		this.sprite.body.drag.x = 0;
		this.sprite.body.drag.y = 0;
		this.sprite.body.bounce.x = 1;
		this.sprite.body.bounce.y = 1;
		this.sprite.body.setSize(40, 40, 12, 12);

		const theta = Math.random()*Math.PI*2;
		this.sprite.body.velocity.x = Math.cos(theta)*220;
		this.sprite.body.velocity.y = Math.sin(theta)*220;
	}

	update() {
		super.update();
		this.sprite.angle += 1;
	}
}
