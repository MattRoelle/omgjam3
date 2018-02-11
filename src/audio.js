const SFX_TYPES = {
	WIN: { 
		key: "win",
		volume: 0.4
	},
	SHOOT1: { 
		key: "shoot1",
		volume: 0.25
	},
	SHOOT2: { 
		key: "shoot2",
		volume: 0.25
	},
	EXPL: { 
		key: "expl",
		volume: 0.45
	},
	EXPL2: { 
		key: "expl2",
		volume: 0.35
	},
};
 
class GameAudio {
	constructor() {
		this.muted = false;
	}

	toggleMute() {
		this.muted = !this.muted;
		game.phaser.sound.volume = this.muted ? 0 : 1;
		return this.muted;
	}

	playMusic() {
		this.music.play();
	}

	pauseMusic() {
		if (this.music) {
			this.music.pause();
		}
	}

	startMusic() {
		this.music = game.phaser.add.audio("theme");
		this.music.loop = true;
		this.music.volume = 0.45;
		this.playMusic();
	}

	playSfx(s) {
		try {
		const sfx = game.phaser.add.audio(s.key);
		sfx.volume = s.volume;
		sfx.play();
		} catch (e) {}
	}
}
