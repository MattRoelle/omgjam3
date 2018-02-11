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
		this.lastHitAt = 0;


		this.overlayShader = game.phaser.add.filter("EnemyOverlay", this.sprite.texture.width, this.sprite.texture.height);
		this.overlayShader.colorR = 1;
		this.overlayShader.colorG = 0;
		this.overlayShader.colorB = 0;
		this.sprite.filters = [this.overlayShader];

		this.bullets = [];
		this.angle = 0;
		this.lastShotAt = 0;

		this.progSvc = progSvc;

		this.group = group;
		group.add(this.sprite);
		this.dead = false;
	
	}

	update() {
		if (this.dead) return;
		const t = game.phaser.time.now;
		this.overlayShader.update();

		if (t - this.lastHitAt < 80) {
			this.overlayShader.colorA = 1;
		} else {
			this.overlayShader.colorA = 0;
		}

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
				this.sprite.body.velocity.x += Math.cos(theta)*this.progSvc.playerStats.speed.value*y;
				this.sprite.body.velocity.y += Math.sin(theta)*this.progSvc.playerStats.speed.value*y;
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
		if (t - this.lastShotAt > this.progSvc.playerStats.rateOfFire.value) {
			this.lastShotAt = t;

			let damage = this.progSvc.playerStats.damage.value;
			damage *= (Math.random()*0.5)+1;
			damage = Math.round(damage);
			this.bullets.push(new PlayerBullet(this.sprite.position.x, this.sprite.position.y, this.angle, this.group, this.progSvc.playerStats.shotSpeed.value, this.progSvc.playerStats.range.value, damage, this.progSvc.playerStats.accuracy.value));

			const theta = this.sprite.angle*Math.PI/180 - (Math.PI/2);
			//this.sprite.body.velocity.x += Math.cos(theta)*-50;
			//this.sprite.body.velocity.y += Math.sin(theta)*-50;
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
	constructor(x, y, theta, group, shotSpeed, range, damage, accuracy) {
		this.range = range;
		this.sprite = game.phaser.add.sprite(x, y, "bullet");
		this.damage = damage;
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
