class Player {
	constructor(group, progSvc) {
		this.sprite = game.phaser.add.sprite(250, 250, "ship");
		this.sprite.anchor.set(0.5);
		game.phaser.physics.arcade.enable(this.sprite);
		this.sprite.body.setSize(16, 16, 12, 14);
		this.sprite.body.drag.x = C.PLAYER_DRAG;
		this.sprite.body.drag.y = C.PLAYER_DRAG;
		this.sprite.body.bounce.x = 0.8;
		this.sprite.body.bounce.y = 0.8;
		this.sprite.body.immovable = true;
		this.cameraTarget = game.phaser.add.sprite(400, 500);

		this.bullets = [];
		this.angle = 0;
		this.lastShotAt = 0;

		this.progSvc = progSvc;

		this.group = group;
		group.add(this.sprite);
	
	}

	update() {
		let rx = 0, y = 0, sx = 0;

		if       ( game.input.left()   ) rx = -1;
		else if  ( game.input.right()  ) rx = 1;

		/*
		if       ( game.input.strafeLeft()   ) sx = -1;
		else if  ( game.input.strafeRight()  ) sx = 1;
		*/

		if       ( game.input.up()     ) y = -1;
		else if  ( game.input.down()   ) y = 1;

		if (rx < 0) this.angle -= 0.05;
		else if (rx > 0) this.angle += 0.05;

		let theta = this.angle;

		if (sx < 0) theta += Math.PI/2;
		else if (sx > 0) theta -= Math.PI/2;

		if (y != 0 || sx != 0) {
			const magnitude = game.utils.dist(this.sprite.body.velocity.x, this.sprite.body.velocity.y, 0, 0);
			if (magnitude < C.PLAYER_MAX_SPEED) {
				y = y || 1;
				this.sprite.body.velocity.x += Math.cos(theta)*C.PLAYER_BASE_SPEED*y;
				this.sprite.body.velocity.y += Math.sin(theta)*C.PLAYER_BASE_SPEED*y;
			}
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
		if (t - this.lastShotAt > this.progSvc.playerStats.rateOfFire) {
			this.lastShotAt = t;
			this.bullets.push(new PlayerBullet(this.sprite.position.x, this.sprite.position.y, this.angle, this.group, this.progSvc.playerStats.shotSpeed, this.progSvc.playerStats.range));

			const theta = this.sprite.angle*Math.PI/180 - (Math.PI/2);
			this.sprite.body.velocity.x += Math.cos(theta)*-100;
			this.sprite.body.velocity.y += Math.sin(theta)*-100;
		}
	}

	render() {
	}

	destroy() {
		this.sprite.destroy();
		this.cameraTarget.destroy();
	}
}

class PlayerBullet {
	constructor(x, y, theta, group, shotSpeed, range) {
		this.range = range;
		this.sprite = game.phaser.add.sprite(x, y, "bullet");
		this.sprite.anchor.set(0.5);
		game.phaser.physics.arcade.enable(this.sprite);
		this.sprite.body.setSize(32, 32, 0, 0);
		this.dead = false;
		this.spawnAt = game.phaser.time.now;

		theta += (Math.random() - 0.5)*0.3;

		const c = Math.cos(theta);
		const s = Math.sin(theta);
		this.sprite.position.x += c*-20;
		this.sprite.position.y += s*-20;
		this.sprite.body.velocity.x = c*-shotSpeed;
		this.sprite.body.velocity.y = s*-shotSpeed;

		this.sprite.angle = (theta*180/Math.PI) - 90;
		game.controller.worldRotGroup.add(this.sprite);
		this.group = group;
		group.add(this.sprite);
		game.utils.effect(this.sprite.position.x, this.sprite.position.y, "muzzleflash", this.group);
	}

	onOverlap() {
		this.dead = true;
	}

	update() {
		if (game.phaser.time.now > this.spawnAt + this.range) {
			this.dead = true;
			this.destroy(true);
		}
	}

	destroy(noExpl) {
		if (!noExpl) {
			game.utils.effect(this.sprite.position.x, this.sprite.position.y, "smexpl", this.group);
		}
		this.sprite.destroy();
	}
}
