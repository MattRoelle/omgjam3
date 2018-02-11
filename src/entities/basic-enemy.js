class BasicEnemy extends Enemy {
	init(x, y) {
		this.sprite = game.phaser.add.sprite(x, y, "enemy1");
		this.health = 50;

		this.movementAi = new FollowMovementAI(this);
		this.movementAi.speed = 2;
		this.movementAi.maxSpeed = 150;

		this.combatAi = new BasicCombatAI(this);
		this.combatAi.rateOfFire = 2000;
		this.combatAi.bulletSpeed = 300;
	}
}
