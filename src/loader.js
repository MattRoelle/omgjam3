class Loader {
	load(g) {
		g.load.image("overlay", "assets/overlay.png");
		g.load.image("enemy-bullet", "assets/enemy-bullet.png");
		g.load.image("ship", "assets/ship.png");
		g.load.image("bullet", "assets/bullet.png");
		g.load.image("enemy1", "assets/enemy1.png");
		g.load.spritesheet("muzzleflash", "assets/muzzleflash.png", 32, 32);
		g.load.spritesheet("lgexpl", "assets/lgexpl.png", 120, 120);
		g.load.spritesheet("smexpl", "assets/smexpl.png", 52, 52);
		g.load.spritesheet("green-smexpl", "assets/green-smexpl.png", 52, 52);
		g.load.spritesheet("bouncer", "assets/bouncer.png", 64, 64);
		g.load.image("tilemap", "assets/tilemap.png", 32, 32);
		g.load.tilemap("level1", "assets/levels/level1.json", null, Phaser.Tilemap.TILED_JSON);
		g.load.text("world-rotation", "src/shaders/world-rotation.glsl");
		g.load.text("enemy-overlay", "src/shaders/enemy-overlay.glsl");
		g.load.image("marker", "assets/marker.png");
	}
}

loader = new Loader();
