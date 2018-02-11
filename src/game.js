const GAME_STATES = {
	TITLE    : 0,
	IN_GAME  : 1,
	VICTORY  : 2,
	PAUSED   : 3,
	SETTINGS : 5
};

const controllerCtorLookup = {
	[GAME_STATES.TITLE]   : MainMenuController,
	[GAME_STATES.IN_GAME] : GameController,
};

class Game {
	constructor() {
		this.setup = {
			preload: this.preload.bind(this),
			create: this.create.bind(this),
			update: this.update.bind(this),
			render: this.render.bind(this)
		};

		this.input  = new Input();
		this.utils  = new Utils();
		this.audio  = new GameAudio();
		this.phaser = new Phaser.Game(C.SCREEN_WIDTH, C.SCREEN_HEIGHT, Phaser.WEBGL, "game-host", this.setup, false, false);
	}

	switchState(state, stateParams) {
		this.beginSwitchState(() => {
			if (this.controller) this.controller.destroy();
			game.phaser.camera.unfollow();
			game.phaser.camera.resetFX();
			game.phaser.camera.setPosition(0, 0);
			this.controller = new (controllerCtorLookup[state])(stateParams);
			this.state = state;
			this.finishSwitchState();
		});
	}

	beginSwitchState(cb) {
		if (this.controller && this.controller.exitTransition) this.controller.exitTransition(cb);
		else this.fadeOut(cb);
	}

	finishSwitchState(cb) {
		if (this.controller && this.controller.enterTransition) this.controller.enterTransition(cb);
		else this.fadeIn(cb);
	}

	mute() {
		this.audio.toggleMute();
		if (!this.audio.muted) {
			this.muteBtn.text = "mute";
		} else {
			this.muteBtn.text = "unmute";
		}

	}

	fullscreen() {
		this.phaser.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.phaser.scale.startFullScreen(false);
	}

	preload() {
		loader.load(this.phaser);
		this.phaser.time.advancedTiming = true;
	}

	create() {
		this.fullscreenBtn = this.phaser.add.text(5, 0, "fullscreen", {
			font: "16px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 2,
			align: "left"
		});
		this.fullscreenBtn.fixedToCamera = true;
		this.fullscreenBtn.inputEnabled = true;
		this.fullscreenBtn.events.onInputDown.add(() => {
			this.fullscreen();
		}, this);

		this.muteBtn = this.phaser.add.text(600, 0, "mute", {
			font: "16px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 2,
			align: "left"
		});
		this.muteBtn.fixedToCamera = true;
		this.muteBtn.inputEnabled = true;
		this.muteBtn.events.onInputDown.add(() => {
			this.mute();
		}, this);

		game.phaser.physics.arcade.TILE_BIAS = 40;
		initWorldShader(this.phaser.cache.getText("world-rotation"));
		initEnemyOverlayShader(this.phaser.cache.getText("enemy-overlay"));
		this.phaser.physics.startSystem(Phaser.Physics.ARCADE);
		this.input.init();

		const _this = this;
		_this.switchState(GAME_STATES.TITLE);
		
		game.phaser.stage.backgroundColor = "#000000";

		this.audio.startMusic();
	}

	fadeOut(cb) {
		this.phaser.camera.fade(0x000000, 1000);
		setTimeout(() => {
			this.phaser.camera.resetFX();
			!!cb && cb();
		}, 1000);
		//const t = this.phaser.add.tween(this.pixelateFilter).to( { sizeX: 20, sizeY: 20 }, 400, "Quad.easeInOut", true, 0);
		//if (!!cb) t.onComplete.add(cb);
	}

	fadeIn(cb) {
		this.phaser.camera.flash(0x000000, 1000);
		setTimeout(() => {
			this.phaser.camera.resetFX();
			!!cb && cb();
		}, 1000);
		//const t = this.phaser.add.tween(this.pixelateFilter).to( { sizeX: 1, sizeY: 1 }, 400, "Quad.easeInOut", true, 0);
		//if (!!cb) t.onComplete.add(cb);
	}

	showTitle(cb) {
		const bg = this.phaser.add.graphics(0, 0);
		bg.beginFill(0xFFFFFF);
		bg.drawRect(0, 0, C.SCREEN_WIDTH, C.SCREEN_HEIGHT); 

		const logoSpr = this.phaser.add.sprite(400, 300, "logo");
		logoSpr.anchor.set(0.5);

		const _this = this;

		let destroyed = false;
		let tween;

		const destroyCb = () => {
			if (destroyed) return;
			destroyed = true;

			if (!!tween) {
				tween.stop();
				_this.phaser.world.alpha = 1;
			}

			window.removeEventListener("keydown", destroyCb);

			logoSpr.destroy();
			bg.destroy();
			cb();
		};

		window.addEventListener("keydown", destroyCb);
		_this.input.gamepad.onDownCallback = destroyCb;

		const fadeInCb = () => {
			if (destroyed) return;
			tween.onComplete.add(() => {
				setTimeout(() => {
					destroyCb();
				}, 250);
			});
		};
		const tout = setTimeout(fadeInCb, 1150);
	}

	update() {
		if (this.controller) this.controller.update();
		this.input.update();

		this.fullscreenBtn.bringToTop();
		this.muteBtn.bringToTop();
	}

	render() {
		if (this.controller) this.controller.render();
	}

	reset() {
	}
}


