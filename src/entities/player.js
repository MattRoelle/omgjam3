class Player {
	constructor() {
		this.sprite = game.phaser.add.sprite(400, 500, "ship");
		this.sprite.anchor.set(0.5);
		game.phaser.physics.arcade.enable(this.sprite);
		this.sprite.body.setSize(16, 16, 12, 14);
		this.cameraTarget = game.phaser.add.sprite(400, 500);

		this.bullets = [];

		this.onShoot = () => { this.shoot(); };
		game.input.onMain.add(this.onShoot, this);
	}

	update() {
		let x = 0, y = 0;

		if       ( game.input.left()   ) x = -1;
		else if  ( game.input.right()  ) x = 1;
		if       ( game.input.up()     ) y = -1;
		else if  ( game.input.down()   ) y = 1;

		if (x != 0 || y != 0) {

			const theta = Math.atan2(y, x);

			this.sprite.body.velocity.x = Math.cos(theta)*C.PLAYER_BASE_SPEED;
			//this.sprite.body.velocity.y = Math.sin(theta)*C.PLAYER_BASE_SPEED;
		} else {
			this.sprite.body.velocity.x = 0;
			this.sprite.body.velocity.y = 0;
		}

		this.sprite.body.velocity.y = -C.WORLD_SCROLL_SPEED;

		if       ( x < 0 )  this.sprite.angle = -10;
		else if  ( x > 0 )  this.sprite.angle = 10;
		else 				this.sprite.angle = 0;

		for(let b of this.bullets) {
			b.update();
			if (b.dead) b.destroy();
		}

		this.bullets = this.bullets.filter(b => !b.dead);

		this.cameraTarget.position.x = this.sprite.position.x;
		this.cameraTarget.position.y = this.sprite.position.y - 200;
	}

	shoot() {
		this.bullets.push(new Bullet(this.sprite.position.x, this.sprite.position.y));
	}

	render() {
	}

	destroy() {
		this.sprite.destroy();
		this.cameraTarget.destroy();
		game.input.onMain.remove(this.onShoot, this);
	}
}

class Bullet {
	constructor(x, y) {
		this.sprite = game.phaser.add.sprite(x, y, "bullet");
		this.sprite.anchor.set(0.5);
		game.phaser.physics.arcade.enable(this.sprite);
		this.sprite.body.setSize(32, 32, 0, 0);
		this.dead = false;
	}

	onOverlap() {
		console.log("overlapping");
		this.dead = true;
	}

	update() {
		this.sprite.body.velocity.y = -500;
	}

	destroy() {
		game.utils.explosion(this.sprite.position.x, this.sprite.position.y, "sm");
		this.sprite.destroy();
	}
}
