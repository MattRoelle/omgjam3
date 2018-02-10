const PLAY_STATES = {
	PLAYING: 1,
	PAUSED: 2,
	FINISHED: 3
};

const entityCtorLookup = {
	"enemy1": Enemy1
};

class GameController {
	constructor(params) {
		this.rotationShader = game.phaser.add.filter("WorldRotation", C.SCREEN_WIDTH, C.SCREEN_HEIGHT);
		this.rotationShader.originX = 300/C.SCREEN_WIDTH;
		this.rotationShader.originY = 300/C.SCREEN_HEIGHT;
		this.worldRotGroup = game.phaser.add.group();
		//this.worldRotGroup.filters = [this.rotationShader];

		this.collisionLayers = [];
		this.createLevel();
		this.player = new Player(this.worldRotGroup);
		game.phaser.camera.follow(this.player.cameraTarget);
		game.phaser.camera.bounds = null;

		this.waveNumber = 0;
		this.entities = [];
		this.startWave();
		this.waveStartedAt = 0;
	}

	startWave() {
		this.waveNumber++;
		this.waveStartedAt = game.phaser.time.now;
		this.entities.push(new Enemy1(500, 500));
	}

	createLevel() {
		const map = game.phaser.add.tilemap("level1");
		map.addTilesetImage("tilemap", "tilemap");

		let colIdx = 0;
		for(let j = 0; j < map.layers.length; j++) {
			const tileLayer = map.createLayer(j);
			tileLayer.visible = tileLayer.layer.visible;
			if (tileLayer.layer.name === "collision") {
				colIdx = j;
				this.collisionLayers.push(tileLayer);
			}
			tileLayer.resizeWorld();
			this.worldRotGroup.add(tileLayer);
		}
		map.setCollisionByExclusion([1], true, colIdx);
		this.map = map;

		console.log(map);
	}

	update() {
		this.player.update();

		for(let i = 0; i < this.collisionLayers.length; i++) {
			const colLayer = this.collisionLayers[i];
			game.phaser.physics.arcade.collide(this.player.sprite, colLayer);
			for(let b of this.player.bullets) {
				game.phaser.physics.arcade.collide(b.sprite, colLayer, () => { b.dead = true });
			}
		}

		for(let e of this.entities) {
			e.update();
		}

		if (this.state == PLAY_STATES.PLAYING) {
		} else if (this.state == PLAY_STATES.PAUSED) {
		} else if (this.state == PLAY_STATES.FINISHED) {
		}

		//game.phaser.world.pivot.set(this.player.sprite.x - C.SCREEN_WIDTH/2, this.player.sprite.y - C.SCREEN_HEIGHT/2);
		this.rotationShader.theta = -(this.player.angle - Math.PI/2);
		this.rotationShader.update();
	}

	render() {
		this.player.render();
	}
}
