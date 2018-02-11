class Enemy {
	constructor(x, y, group, progSvc) {
		this.progSvc = progSvc;
		this.init(x, y);

		this.sprite.anchor.set(0.5);
		this.group = group;
		group.add(this.sprite);
		game.phaser.physics.arcade.enable(this.sprite);
		this.sprite.body.immovable = true;
		this.sprite.body.setSize(16, 16, 16, 16);
		this.sprite.body.bounce.x = 0.8;
		this.sprite.body.bounce.y = 0.8;

		this.overlayShader = game.phaser.add.filter("EnemyOverlay", this.sprite.texture.width, this.sprite.texture.height);
		this.overlayShader.colorR = 1;
		this.overlayShader.colorG = 1;
		this.overlayShader.colorB = 1;
		this.sprite.filters = [this.overlayShader];

		this.lastHitAt = 0;
		this.dead = false;

		this.movementAi = this.movementAi || new MovementAI();
		this.combatAi = this.combatAi || new CombatAI();

		this.postInit();

        /*
		this.hpBar = game.phaser.add.graphics(x, y - 20);
		this.group.add(this.hpBar);
        */
	}

	init(x, y) {
	}

	postInit(){}

	update() {
		if (this.dead) return;
		const t = game.phaser.time.now;

		this.overlayShader.update();

		if (t - this.lastHitAt < 60) {
			this.overlayShader.colorA = 1;
		} else {
			this.overlayShader.colorA = 0;
		}

		if (this.health <= 0) this.die();

		this.movementAi.update();
		this.combatAi.update();

		const w = Math.max(0, this.health/this.maxHealth)*50;
        /*
		if (this.rotHpBar) {
			this.hpBar.angle = this.sprite.angle;

			const theta  = this.sprite.angle*Math.PI/180;

			this.hpBar.position.x = this.sprite.position.x + Math.cos(theta)*30;
			this.hpBar.position.y = this.sprite.position.y + Math.sin(theta)*30;
		} else {
			this.hpBar.position.x = this.sprite.position.x;
			this.hpBar.position.y = this.sprite.position.y - 20;
		}
		this.hpBar.anchor.set(0.5);
		this.hpBar.drawRect(-w, 0, w, 10);
		this.hpBar.beginFill(0xFF0000);
        */
	}

	render() {

	}

	die() {
		if (this.dead) return;
		game.utils.effect(this.sprite.position.x, this.sprite.position.y, "lgexpl", this.group);
		game.audio.playSfx(SFX_TYPES.EXPL2);
		this.dead = true;
		this.destroy();
	}

	onHit(damage, critHit) {
		this.lastHitAt = game.phaser.time.now;
		game.utils.dmgNumber(this.sprite.x, this.sprite.y, damage, this.group,
			critHit ? "#FFFF00" : "#FF0000");

		game.audio.playSfx(SFX_TYPES.EXPL);
		this.health -= damage;
		//this.hpBar.clear();
	}

	destroy() {
		this.sprite.destroy();
	}
}

class MovementAI {
	constructor(entity) {
		this.entity = entity;
	}
	update() {
	}
}

class FollowMovementAI extends MovementAI {
	constructor(entity) {
		super(entity);
	}

	update() {
		if (this.entity.dead) return;
		const player = game.controller.player;
		if (!!player) {
			const theta = Math.atan2(
				this.entity.sprite.position.y - player.sprite.position.y,
				this.entity.sprite.position.x - player.sprite.position.x
			);
			const magnitude = game.utils.dist(this.entity.sprite.body.velocity.x, this.entity.sprite.body.velocity.y, 0, 0);
			if (magnitude < this.maxSpeed) {
				this.entity.sprite.body.velocity.x += Math.cos(theta)*-this.speed;
				this.entity.sprite.body.velocity.y += Math.sin(theta)*-this.speed;
			}
			this.entity.sprite.angle = theta*180/Math.PI - 90;
		}
	}
}

class CombatAI {
	constructor(entity) {
		this.entity = entity;
	}
	update() {
	}
}

class BasicCombatAI extends CombatAI {
	constructor(entity) {
		super(entity);
		this.bullets = [];
		this.bulletSpeed = 1;
		this.rateOfFire = 1000;
		this.lastShotAt = game.phaser.time.now + Math.floor(Math.random()*2000);
	}

	update() {
		if (this.entity.dead) return;
		const player = game.controller.player;
		if (!!player) {
			const t = game.phaser.time.now;

			if (t - this.lastShotAt > this.rateOfFire) {
				this.lastShotAt = t;
				this.shoot();
			}
		}

		for(let b of this.bullets) {
			if (b.dead) b.destroy();
		}

		this.bullets = this.bullets.filter(b => !b.dead);
	}

	shoot() {

		this.bullets.push(new EnemyBullet(
			this.entity.sprite.position.x,
			this.entity.sprite.position.y,
			this.entity.sprite.angle*Math.PI/180 + (Math.PI/2),
			this.entity.group,
			this.bulletSpeed
		));
	}
}

class EnemyBullet {
	constructor(x, y, theta, group, speed) {
		this.sprite = game.phaser.add.sprite(x, y, "enemy-bullet");
		this.sprite.anchor.set(0.5);
		game.phaser.physics.arcade.enable(this.sprite);
		this.sprite.body.setSize(32, 32, 0, 0);
		this.dead = false;

		theta += (Math.random() - 0.5)*0.9;

		const c = Math.cos(theta);
		const s = Math.sin(theta);
		this.sprite.position.x += c*-20;
		this.sprite.position.y += s*-20;
		this.sprite.body.velocity.x = c*-speed;
		this.sprite.body.velocity.y = s*-speed;

		this.sprite.angle = (theta*180/Math.PI) - 90;
		game.controller.worldRotGroup.add(this.sprite);
		this.group = group;
		group.add(this.sprite);
		game.utils.effect(this.sprite.position.x, this.sprite.position.y, "muzzleflash", this.group);
	}

	update() {
	}

	onOverlap() {
		this.dead = true;
	}

	destroy() {
		game.utils.effect(this.sprite.position.x, this.sprite.position.y, "green-smexpl", this.group);
		this.sprite.destroy();
        /*
		if (!!this.hpBar) {
			this.hpBar.destroy();
		}
        */
	}
}
