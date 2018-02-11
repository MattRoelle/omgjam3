const PLAY_STATES = {
	PLAYING: 1,
	PAUSED: 2,
	FINISHED: 3,
	IN_BETWEEN_WAVES: 4,
	IN_SHOP: 5,
    ENDING_WAVE: 6,
    DEAD: 7
};

class GameController {
	constructor(params) {
		this.state = PLAY_STATES.IN_BETWEEN_WAVES;
		this.progSvc = new ProgressionService();

		this.diedAt = game.phaser.time.now;
		this.destroyables = [];
		this.destroyed = false;

		this.hp = 3;

		this.rotationShader = game.phaser.add.filter("WorldRotation", C.SCREEN_WIDTH, C.SCREEN_HEIGHT);
		this.rotationShader.originX = 350/C.SCREEN_WIDTH;
		this.rotationShader.originY = 350/C.SCREEN_HEIGHT;
		this.worldRotGroup = game.phaser.add.group();
		this.worldRotGroup.filters = [this.rotationShader];

		this.collisionLayers = [];
		this.enemySpawnZones = [];
		this.playerSpawn = null;
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

		this.score = 0;

		//this.uiOverlay = game.phaser.add.sprite(0, 0, "overlay");
		//this.uiOverlay.fixedToCamera = true;
		
		this.destroyables = [];
		this.setupUI();
	}

	setupUI() {
		this.uiEls = {};
		this.uiEls.rofLbl = this._addUIText(620, 570, 18, "ROF.1");
		this.uiEls.dmgLbl = this._addUIText(620, 590, 18, "DMG.1");
		this.uiEls.sspLbl = this._addUIText(620, 610, 18, "SSP.1");
		this.uiEls.rngLbl = this._addUIText(620, 630, 18, "RNG.1");
		this.uiEls.spdLbl = this._addUIText(620, 650, 18, "SPD.1");
		this.uiEls.accLbl = this._addUIText(620, 670, 18, "ACC.1");
		this.uiEls.hpLbl = this._addUIText(540, 670, 18, "HP.1");
		this.uiEls.crcLbl = this._addUIText(540, 650, 18, "CRC.1");

		this.uiEls.wavLbl = this._addUIText(20, 670, 18, "WAVE 1");
		this.uiEls.crdLbl = this._addUIText(20, 650, 18, "$0");

		this.uiEls.enemiesRemaining = this._addUIText(20, 20, 18, "Num. Enemies");
		this.uiEls.enemiesRemainingLbl = this._addUIText(20, 40, 18, "0");

		this.uiEls.healthLbl = this._addUIText(20, 60, 24, "HP 3");

		this.uiEls.score = this._addUIText(620, 20, 18, "Score");
		this.uiEls.scoreLbl = this._addUIText(620, 40, 18, "0");
	}

	updateUI() {
		this.uiEls.rofLbl.text = "ROF." + this.progSvc.playerStats.rateOfFire.level;
		this.uiEls.dmgLbl.text = "DMG." + this.progSvc.playerStats.damage.level;
		this.uiEls.sspLbl.text = "SSP." + this.progSvc.playerStats.shotSpeed.level;
		this.uiEls.rngLbl.text = "RNG." + this.progSvc.playerStats.range.level;
		this.uiEls.spdLbl.text = "SPD." + this.progSvc.playerStats.speed.level;
		this.uiEls.accLbl.text = "ACC." + this.progSvc.playerStats.accuracy.level;
		this.uiEls.hpLbl.text  = "HP." + this.progSvc.playerStats.hp.level;
		this.uiEls.crcLbl.text  = "CRC." + this.progSvc.playerStats.critChance.level;

		this.uiEls.wavLbl.text = "WAVE " + this.progSvc.waveNumber;
		this.uiEls.crdLbl.text = "$" + this.progSvc.credits;

		this.uiEls.healthLbl.text = "HP " + this.hp;

		this.uiEls.enemiesRemainingLbl.text = this.enemies.length;
		this.uiEls.scoreLbl.text = this.score;
	}

	_addUIText(x, y, sz, s) {
		const txt = game.phaser.add.text(x, y, s, {
			font: sz + "px slkscr",
			fill: "#f1f1aa",
			stroke: "#000000",
			strokeThickness: 4,
			align: "left"
		});
		txt.fixedToCamera = true;
		this.destroyables.push(txt);
		return txt;
	}

	die() {
		if (this.state == PLAY_STATES.DEAD) return;
		this.state = PLAY_STATES.DEAD;
		this.diedAt = game.phaser.time.now;

		game.audio.playSfx(SFX_TYPES.EXPL)
		setTimeout(() => game.audio.playSfx(SFX_TYPES.EXPL), 200);
		setTimeout(() => game.audio.playSfx(SFX_TYPES.EXPL), 400);

		game.utils.effect(this.player.sprite.position.x, this.player.sprite.position.y, "lgexpl", this.worldRotGroup)
		setTimeout(() => game.utils.effect(this.player.sprite.position.x + (Math.random()-0.5)*40, this.player.sprite.position.y  + (Math.random()-0.5)*40, "lgexpl", this.worldRotGroup), 50);
		setTimeout(() => game.utils.effect(this.player.sprite.position.x + (Math.random()-0.5)*40, this.player.sprite.position.y  + (Math.random()-0.5)*40, "lgexpl", this.worldRotGroup), 150);
		setTimeout(() => game.utils.effect(this.player.sprite.position.x + (Math.random()-0.5)*40, this.player.sprite.position.y  + (Math.random()-0.5)*40, "lgexpl", this.worldRotGroup), 250);
		setTimeout(() => game.utils.effect(this.player.sprite.position.x + (Math.random()-0.5)*40, this.player.sprite.position.y  + (Math.random()-0.5)*40, "lgexpl", this.worldRotGroup), 350);
		setTimeout(() => game.utils.effect(this.player.sprite.position.x + (Math.random()-0.5)*40, this.player.sprite.position.y  + (Math.random()-0.5)*40, "lgexpl", this.worldRotGroup), 450);
		setTimeout(() => game.utils.effect(this.player.sprite.position.x + (Math.random()-0.5)*40, this.player.sprite.position.y  + (Math.random()-0.5)*40, "lgexpl", this.worldRotGroup), 550);
		setTimeout(() => game.utils.effect(this.player.sprite.position.x + (Math.random()-0.5)*40, this.player.sprite.position.y  + (Math.random()-0.5)*40, "lgexpl", this.worldRotGroup), 650);

		this.player.sprite.alpha = 0;
		this.player.dead = true;
		this.player.sprite.body.velocity.x = 0;
		this.player.sprite.body.velocity.y = 0;

		setTimeout(() => {
			const deathText = game.phaser.add.text(C.SCREEN_WIDTH/2, -200, "GAME OVER", {
				font: "60px slkscr",
				fill: "#ff0000",
				stroke: "#000000",
				strokeThickness: 6,
				align: "center"
			});

			deathText.fixedToCamera = true;
			deathText.pivot.set(0.5);
			deathText.anchor.set(0.5);

			game.phaser.add.tween(deathText.cameraOffset).to({
				x: 350,
				y: 200
			}, 1400, Phaser.Easing.Bounce.Out, true);

			const contText = game.phaser.add.text(C.SCREEN_WIDTH/2, -100, "Press shoot to continue", {
				font: "30px slkscr",
				fill: "#ffffff",
				stroke: "#000000",
				strokeThickness: 6,
				align: "center"
			});

			contText.fixedToCamera = true;
			contText.pivot.set(0.5);
			contText.anchor.set(0.5);

			game.phaser.add.tween(contText.cameraOffset).to({
				x: 350,
				y: 300
			}, 1400, Phaser.Easing.Bounce.Out, true);

			this.destroyables.push(deathText);
			this.destroyables.push(contText);
		}, 1000);
	}

	startWave() {
		if (this.startingWave) return;

		this.hp = this.progSvc.playerStats.hp.value;

		this.player.sprite.position.x = this.playerSpawn.x;
		this.player.sprite.position.y = this.playerSpawn.y;

		for(let m of this.enemyMarkers) m.destroy();
		this.enemyMarkers = [];

		this.startingWave = true;
		this.state = PLAY_STATES.IN_BETWEEN_WAVES;

		this.waveNumber++;
		this.progSvc.setWave(this.waveNumber);
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
			this.spawnEnemies();
			this.startingWave = false;
			this.updateUI();
		}, 3000);
	}

	spawnEnemies() {
		const enemiesToSpawn = this.progSvc.getEnemies();

		for(let e of enemiesToSpawn) {
			const zone = this.enemySpawnZones[Math.floor(Math.random()*this.enemySpawnZones.length)];

			const spawnX = zone.x + Math.random()*zone.w;
			const spawnY = zone.y + Math.random()*zone.h;

			const enmy = new e(spawnX, spawnY, this.worldRotGroup, this.progSvc);
			this.enemies.push(enmy);
		}

		for(let e of this.enemies) {
			this.enemyMarkers.push(new Marker(e, this.player, this.worldRotGroup));
		}
	}

    endWave() {
        if (this.state == PLAY_STATES.ENDING_WAVE) return;

        this.state = PLAY_STATES.ENDING_WAVE;

        game.audio.playSfx(SFX_TYPES.WIN);

		const endText = game.phaser.add.text(C.SCREEN_WIDTH/2, -200, "WAVE COMPLETE", {
			font: "60px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 6,
			align: "center"
		});

		endText.fixedToCamera = true;
		endText.pivot.set(0.5);
		endText.anchor.set(0.5);

		const t = game.phaser.add.tween(endText.cameraOffset).to({
			x: 350,
			y: 200
		}, 1400, Phaser.Easing.Bounce.Out, true);

		setTimeout(() => {
			game.phaser.add.tween(endText).to({alpha: 0}, 800, Phaser.Easing.Linear.None, true);
		}, 2000);

		setTimeout(() => {
			endText.destroy();
            this.startShop();
			this.startingWave = false;
		}, 3000);
    }

	startShop() {
        if (this.state == PLAY_STATES.IN_SHOP) return;

		this.state = PLAY_STATES.IN_SHOP;
        game.phaser.camera.fade(0x000000, 800);

        setTimeout(() => {
            this.rotationShader.inShop = 1;
            game.phaser.camera.resetFX();
            game.phaser.camera.flash(0x000000, 800);

            const upgrades = this.progSvc.getUpgradeOptions();

            const selectUpgradeCb = (upg, opt) => {
            	let cont = upg == null;

            	if (upg != null && !!upg.valid) {
                	const succ = this.progSvc.purchaseUpgrade(upg);

                	if (succ) {
                		if (upg.valid) {
                			opt.textEl.text = upg.toString() + " $" + upg.cost;
                		} else {
                			opt.textEl.text = "SOLD OUT";
                		}
                		this.updateUI();
                	} else {
                		// TODO: Sfx
                	}
            	}

            	if (cont) {
            		this.updateUI();
                	this.shopMenu.destroy();
                	this.startWave();
                	this.rotationShader.inShop = 0;
					this.updateUI();
            	}
            };

            const menuOpts = [];
            for(let upg of upgrades) {
                menuOpts.push({
                    text: upg.toString() + " $" + upg.cost,
                    callback: (opt) => selectUpgradeCb(upg, opt),
                    context: this
                });
            }

            menuOpts.push({
            	text: "continue",
            	callback: () => selectUpgradeCb(),
            	context: this
            });

            this.shopMenu = new Menu({ 
                x: 140,
                y: 140,
                options: menuOpts
            });
        }, 1000);
	}

	createLevel() {
		const map = game.phaser.add.tilemap("level1");
		map.addTilesetImage("tilemap", "tilemap");

		this.tileLayers = [];
		let colIdx = 0;
		for(let j = 0; j < map.layers.length; j++) {
			const tileLayer = map.createLayer(j);
			tileLayer.visible = tileLayer.layer.visible;
			if (tileLayer.layer.name === "collision") {
				colIdx = j;
				this.collisionLayers.push(tileLayer);
				this.tileLayers.push(tileLayer);
			}
			tileLayer.resizeWorld();
			this.worldRotGroup.add(tileLayer);
		}

		for(let e of map.objects.entities) {
			if (e.type === "playerSpawn") {
				this.playerSpawn = { x: e.x, y: e.y };
			} else if (e.type == "enemySpawnZone") {
				console.log("zone", e);
				this.enemySpawnZones.push({
					x: e.x,
					y: e.y,
					w: e.width,
					h: e.height
				});
			}
		}

		map.setCollisionByExclusion([1], true, colIdx);
		this.map = map;
	}

	update() {
		if (this.state == PLAY_STATES.DEAD && game.phaser.time.now - this.diedAt > 2000) {
			if (game.input.isShootDown()) {
				game.switchState(GAME_STATES.TITLE);
			}
		}

		if (this.destroyed) return;

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
						game.phaser.physics.arcade.collide(b.sprite, colLayer, () => { 
							b.dead = true
						}, null, this);
					}
				}
			}
		}

		for(let e of this.enemies) {
			e.update();
			for(let b of this.player.bullets) {
				game.phaser.physics.arcade.collide(b.sprite, e.sprite, () => {
					b.dead = true;
					e.onHit(b.damage, b.critHit);

					if (e.health <= 0) {
						let nCredits = 50;
						nCredits += (this.progSvc.waveNumber*20);
						nCredits *= 1 + Math.random();
						nCredits = Math.floor(nCredits);
						this.progSvc.credits += nCredits;
						this.score += nCredits;
						game.utils.dmgNumber(this.player.sprite.position.x, this.player.sprite.position.y, "+ $" + nCredits, this.worldRotGroup, "#00FF00");
						this.updateUI();
					}
				}, null, this);
			}

			game.phaser.physics.arcade.overlap(e.sprite, this.player.sprite, () => {
				const t = game.phaser.time.now;
				if (t - this.player.lastHitAt > 500) {
					this.player.lastHitAt = t;
					game.audio.playSfx(SFX_TYPES.EXPL2);
					this.hp--;
					this.updateUI();
				}
			}, null, this);

			if (!!e.combatAi.bullets) {
				for(let b of e.combatAi.bullets) {
					game.phaser.physics.arcade.collide(b.sprite, this.player.sprite, () => {
						b.dead = true

						const t = game.phaser.time.now;
						if (t - this.player.lastHitAt > 500) {
							game.audio.playSfx(SFX_TYPES.EXPL2);
							this.player.lastHitAt = t;
							this.hp--;
							this.updateUI();
						}
					}, null, this);
				}
			}
		}

		const oldLen = this.enemies.length;
		this.enemies = this.enemies.filter(e => !e.dead);
		const newLen = this.enemies.length;
		if (oldLen != newLen) this.updateUI();

		if (this.state == PLAY_STATES.IN_GAME) {
			if (this.enemies.length <= 0) {
				this.endWave();
			}
		}

		//game.phaser.world.pivot.set(this.player.sprite.x - C.SCREEN_WIDTH/2, this.player.sprite.y - C.SCREEN_HEIGHT/2);
		this.rotationShader.theta = -(this.player.angle - Math.PI/2);

		this.rotationShader.update();

		for(let e of this.enemyMarkers) {
			e.update();
		}

		if (this.hp <= 0) this.die();
	}

	inGameUpdate() {
	}

	render() {
		this.player.render();
	}

	destroy() {
		if (this.destroyed) return;
		this.destroyed = true;
		this.player.destroy();
		for(let l of this.tileLayers) l.destroy();
		this.map.destroy();
		for(let e of this.enemies) e.destroy();
		for(let m of this.enemyMarkers) m.destroy();
		for(let d of this.destroyables) d.destroy();
		this.rotationShader.destroy();
		this.worldRotGroup.destroy();
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
