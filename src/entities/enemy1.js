class Enemy1 {
	constructor(x, y) {
		this.sprite = game.phaser.add.sprite(x, y, "enemy1");
	}

	update() {

	}

	render() {

	}

	destroy() {
		this.sprite.destroy();
	}
}
