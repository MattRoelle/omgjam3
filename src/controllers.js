class MainMenuController {
	constructor() {
		this.destroyables  = [];

		this.menu = new Menu({
			x: 100,
			y: 100,
			options: [
				{
					text: "play",
					callback: () => {
						game.switchState(GAME_STATES.OVERWORLD);
					},
					context: this
				},
				{
					text: "fullscreen",
					callback: () => {
						game.fullscreen();
						//game.switchState(GAME_STATES.SETTINGS);
					},
					context: this
				},
				{
					text: "settings",
					callback: () => {
						game.switchState(GAME_STATES.SETTINGS);
					},
					context: this
				},
			]
		});
		this.destroyables.push(this.menu);
	}

	update() {
	}

	render(){
	}

	destroy() {
		for(let d of this.destroyables) d.destroy();
	}
}

