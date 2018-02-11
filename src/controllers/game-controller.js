const PLAY_STATES = {
	PLAYING: 1,
	PAUSED: 2,
	FINISHED: 3,
	IN_BETWEEN_WAVES: 4,
	IN_SHOP: 5
};

class GameController {
	constructor(params) {
		this.state = PLAY_STATES.IN_BETWEEN_WAVES;
		this.progSvc = new ProgressionService();

		this.rotationShader = game.phaser.add.filter("WorldRotation", C.SCREEN_WIDTH, C.SCREEN_HEIGHT);
		this.rotationShader.originX = 350/C.SCREEN_WIDTH;
		this.rotationShader.originY = 350/C.SCREEN_HEIGHT;
		this.worldRotGroup = game.phaser.add.group();
		this.worldRotGroup.filters = [this.rotationShader];

		this.collisionLayers = [];
		this.createLevel();
		this.player = new Player(this.worldRotGroup, this.progSvc);
		game.phaser.camera.follow(this.player.cameraTarget);
		game.phaser.camera.bounds = null;

		this.waveNumber = 0;
		this.enemies = [];
		this.startingWave = false;
		this.enemyMarkers = [];
		this.startWave();
		this.waveStartedAt = 0;

		//this.uiOverlay = game.phaser.add.sprite(0, 0, "overlay");
		//this.uiOverlay.fixedToCamera = true;
	}

	startWave() {
		if (this.startingWave) return;

		for(let m of this.enemyMarkers) m.destroy();
		this.enemyMarkers = [];

		this.startingWave = true;
		this.state = PLAY_STATES.IN_BETWEEN_WAVES;

		this.waveNumber++;
		this.waveStartedAt = game.phaser.time.now;

		const waveText = game.phaser.add.text(C.SCREEN_WIDTH/2, -200, "WAVE " + this.waveNumber, {
			font: "60px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 6,
			align: "center"
		});

		waveText.fixedToCamera = true;
		waveText.pivot.set(0.5);
		waveText.anchor.set(0.5);

		const t = game.phaser.add.tween(waveText.cameraOffset).to({
			x: 350,
			y: 200
		}, 1400, Phaser.Easing.Bounce.Out, true);

		t.start();


		setTimeout(() => {
			game.phaser.add.tween(waveText).to({alpha: 0}, 800, Phaser.Easing.Linear.None, true);
		}, 2000);

		setTimeout(() => {
			waveText.destroy();
			this.state = PLAY_STATES.IN_GAME;
			this.enemies.push(new BouncerEnemy(350, 350, this.worldRotGroup));
			this.enemies.push(new BasicEnemy(350, 450, this.worldRotGroup));
			this.enemies.push(new BasicEnemy(350, 550, this.worldRotGroup));

			for(let e of this.enemies) {
				this.enemyMarkers.push(new Marker(e, this.player, this.worldRotGroup));
			}
			this.startingWave = false;
		}, 3000);
	}

	startShop() {
		this.state = PLAY_STATES.IN_SHOP;

		const upgrades = this.progSvc.getUpgradeOptions();

		const selectUpgradeCb = (upg) => {
			this.progSvc.purchaseUpgrade(upg);
			this.shopMenu.destroy();
			this.startWave();
		};

		const menuOpts = [];
		for(let upg of upgrades) {
			menuOpts.push({
				text: upg.toString() + " " + upg.cost,
				callback: () => selectUpgradeCb(upg),
				context: this
			});
		}

		this.shopMenu = new Menu({ 
			x: 100,
			y: 100,
			options: menuOpts
		});
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
	}

	update() {
		this.player.update();

		for(let i = 0; i < this.collisionLayers.length; i++) {
			const colLayer = this.collisionLayers[i];
			game.phaser.physics.arcade.collide(this.player.sprite, colLayer);
			for(let b of this.player.bullets) {
				game.phaser.physics.arcade.collide(b.sprite, colLayer, () => { b.dead = true });
			}
			for(let e of this.enemies) {
				game.phaser.physics.arcade.collide(e.sprite, colLayer);
				if (!!e.combatAi.bullets) {
					for(let b of e.combatAi.bullets) {
						game.phaser.physics.arcade.collide(b.sprite, colLayer, () => { b.dead = true });
					}
				}
			}
		}

		for(let e of this.enemies) {
			e.update();
			for(let b of this.player.bullets) {
				game.phaser.physics.arcade.collide(b.sprite, e.sprite, () => {
					b.dead = true;
					e.onHit();
				});
			}

			if (!!e.combatAi.bullets) {
				for(let b of e.combatAi.bullets) {
					game.phaser.physics.arcade.collide(b.sprite, this.player.sprite, () => {
						b.dead = true
					});
				}
			}
		}

		this.enemies = this.enemies.filter(e => !e.dead);

		if (this.state == PLAY_STATES.IN_GAME) {
			if (this.enemies.length <= 0) {
				this.startShop();
			}
		}

		//game.phaser.world.pivot.set(this.player.sprite.x - C.SCREEN_WIDTH/2, this.player.sprite.y - C.SCREEN_HEIGHT/2);
		this.rotationShader.theta = -(this.player.angle - Math.PI/2);
		this.rotationShader.update();

		for(let e of this.enemyMarkers) {
			e.update();
		}
	}

	inGameUpdate() {
	}

	render() {
		this.player.render();
	}
}

class Marker {
	constructor(enemy, player, group) {
		this.sprite = game.phaser.add.sprite(0, 0, "marker");
		this.sprite.anchor.set(0.5);
		this.enemy = enemy;
		this.player = player;
		group.add(this.sprite);
	}

	update() {
		const theta = Math.atan2(
			this.enemy.sprite.position.y - this.player.sprite.position.y,
			this.enemy.sprite.position.x - this.player.sprite.position.x
		) - Math.PI;

		this.sprite.angle = theta*180/Math.PI - (90);

		const c = Math.cos(theta);
		const s = Math.sin(theta);

		this.sprite.position.x = this.player.sprite.position.x - c*320;
		this.sprite.position.y = this.player.sprite.position.y - s*320;

		this.sprite.bringToTop();

		this.sprite.alpha = this.enemy.dead || game.utils.dist(this.enemy.sprite.position.x, this.enemy.sprite.position.y, this.player.sprite.position.x, this.player.sprite.position.y) < 350 ? 0 : 1;
	}

	destroy() {
		this.sprite.destroy();
	}
}
