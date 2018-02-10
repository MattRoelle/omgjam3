class Loader {
	load(g) {
		g.load.image("ship", "assets/ship.png");
		g.load.image("bullet", "assets/bullet.png");
		g.load.image("enemy1", "assets/enemy1.png");
		g.load.spritesheet("lgexpl", "assets/lgexpl.png", 120, 120);
		g.load.spritesheet("smexpl", "assets/smexpl.png", 52, 52);
		g.load.image("tilemap", "assets/tilemap.png", 64, 64);
		g.load.tilemap("level1", "assets/levels/level2.json", null, Phaser.Tilemap.TILED_JSON);
	}
}

loader = new Loader();
