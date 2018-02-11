class MainMenuController {
	constructor(params) {
		this.sprite = game.phaser.add.sprite(0, 0, "title");

		this.versionText = game.phaser.add.text(10, 660, "v1.0", {
			font: "20px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickeness: 4
		});

		this.hasExited = false;
		this.onMainCb = () => {
			if (this.hasExited) return;
			this.hasExited = true;
			game.switchState(GAME_STATES.IN_GAME);
		};
		game.input.onMain.add(this.onMainCb, this);
	}

	update() {
	}

	render() {
	}

	destroy() {
		game.input.onMain.remove(this.onMainCb, this);
		this.sprite.destroy();
		this.versionText.destroy();
	}
}
