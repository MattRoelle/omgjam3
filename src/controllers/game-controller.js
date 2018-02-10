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
		this.collisionLayers = [];
		this.createLevel();
		this.createEntities();
		this.player = new Player();
		this.player.sprite.position.y = this.map.height*32;
		game.phaser.camera.follow(this.player.cameraTarget);
		game.phaser.world.setBounds(0, -1000, 800, 5000);
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
		}
		map.setCollisionByExclusion([1], true, colIdx);
		this.map = map;
	}

	createEntities() {
		for(let obj of this.map.objects.entities)  {
			console.log(obj);
		}
	}

	update() {
		this.player.update();
		this.player.sprite.bringToTop();

		for(let i = 0; i < this.collisionLayers.length; i++) {
			const colLayer = this.collisionLayers[i];
			game.phaser.physics.arcade.collide(this.player.sprite, colLayer);
			for(let b of this.player.bullets) {
				game.phaser.physics.arcade.collide(b.sprite, colLayer, () => { b.dead = true });
			}
		}

		if (this.state == PLAY_STATES.PLAYING) {
		} else if (this.state == PLAY_STATES.PAUSED) {
		} else if (this.state == PLAY_STATES.FINISHED) {
		}
	}

	render() {
		this.player.render();
	}
}
