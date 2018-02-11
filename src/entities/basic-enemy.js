class BasicEnemy extends Enemy {
	init(x, y) {
		this.sprite = game.phaser.add.sprite(x, y, "enemy1");
		this.maxHealth = 20;
		this.health = 20;

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
