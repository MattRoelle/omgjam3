class Player {
	constructor(group) {
		this.sprite = game.phaser.add.sprite(200, 200, "ship");
		this.sprite.anchor.set(0.5);
		game.phaser.physics.arcade.enable(this.sprite);
		this.sprite.body.setSize(16, 16, 12, 14);
		this.sprite.body.drag.x = 100;
		this.sprite.body.drag.y = 100;
		this.sprite.body.bounce.x = 0.5;
		this.sprite.body.bounce.y = 0.5;
		this.cameraTarget = game.phaser.add.sprite(400, 500);

		this.bullets = [];
		this.angle = 0;

		this.rateOfFire = 100;
		this.lastShotAt = 0;

		this.group = group;
		group.add(this.sprite);
	}

	update() {
		let x = 0, y = 0;

		if       ( game.input.left()   ) x = -1;
		else if  ( game.input.right()  ) x = 1;
		if       ( game.input.up()     ) y = -1;
		else if  ( game.input.down()   ) y = 1;

		if (x < 0) this.angle -= 0.05;
		else if (x > 0) this.angle += 0.05;

		if (y != 0) {
			this.sprite.body.velocity.x += Math.cos(this.angle)*C.PLAYER_BASE_SPEED*y;
			this.sprite.body.velocity.y += Math.sin(this.angle)*C.PLAYER_BASE_SPEED*y;
		}

		for(let b of this.bullets) {
			b.update();
			if (b.dead) b.destroy();
		}

		this.bullets = this.bullets.filter(b => !b.dead);

		this.sprite.angle = (this.angle*180/Math.PI) - 90;

		this.cameraTarget.position.x = this.sprite.position.x;
		this.cameraTarget.position.y = this.sprite.position.y;

		if (game.input.isShootDown()) this.shoot();
	}

	shoot() {
		const t = game.phaser.time.now;
		if (t - this.lastShotAt > this.rateOfFire) {
			this.lastShotAt = t;
			this.bullets.push(new Bullet(this.sprite.position.x, this.sprite.position.y, this.angle, this.group));
		}
	}

	render() {
	}

	destroy() {
		this.sprite.destroy();
		this.cameraTarget.destroy();
	}
}

class Bullet {
	constructor(x, y, theta, group) {
		this.sprite = game.phaser.add.sprite(x, y, "bullet");
		this.sprite.anchor.set(0.5);
		game.phaser.physics.arcade.enable(this.sprite);
		this.sprite.body.setSize(32, 32, 0, 0);
		this.dead = false;

		theta += (Math.random() - 0.5)*0.3;

		const c = Math.cos(theta);
		const s = Math.sin(theta);
		this.sprite.position.x += c*-20;
		this.sprite.position.y += s*-20;
		this.sprite.body.velocity.x = c*-C.PLAYER_BULLET_BASE_SPEED;
		this.sprite.body.velocity.y = s*-C.PLAYER_BULLET_BASE_SPEED;

		this.sprite.angle = (theta*180/Math.PI) - 90;
		game.controller.worldRotGroup.add(this.sprite);
		this.group = group;
		group.add(this.sprite);
		game.utils.effect(this.sprite.position.x, this.sprite.position.y, "muzzleflash", this.group);
	}

	onOverlap() {
		console.log("overlapping");
		this.dead = true;
	}

	update() {
	}

	destroy() {
		game.utils.effect(this.sprite.position.x, this.sprite.position.y, "smexpl", this.group);
		this.sprite.destroy();
	}
}
