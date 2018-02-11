const UPGRADE_TYPES = {
	ROF_UP: 1,
	SS_UP: 2,
	DMG_UP: 3
};

class ProgressionService {
	constructor() {
		this.waveNumber = 0;

		this.credits = 10000000;

		this.playerStats = {
			rateOfFire: 100,
			shotSpeed: 600,
			damage: 5
		};
	}

	setWave(n) {
		this.waveNumber = n;
	}

	getUpgradeOptions() {
		const baseCost = this.waveNumber * 10;
		return [
			new Upgrade(UPGRADE_TYPES.ROF_UP, baseCost + 100 + (400 - this.playerStats.rateOfFire)*2),
			new Upgrade(UPGRADE_TYPES.SS_UP, baseCost + 100 + (this.playerStats.shotSpeed)*2),
			new Upgrade(UPGRADE_TYPES.DMG_UP,  baseCost + 100 + (this.playerStats.damage)*20)
		];
	}

	purchaseUpgrade(upgrade) {
		if (this.credits - upgrade.cost < 0) return;

		switch(upgrade.type) {
			case UPGRADE_TYPES.ROF_UP:
				this.playerStats.rateOfFire -= 50;
				break;
			case UPGRADE_TYPES.SS_UP:
				this.playerStats.shotSpeed += 50;
				break;
			case UPGRADE_TYPES.DMG_UP:
				this.playerStats.damage *= 1.5; 
				this.playerStats.damage = Math.round(this.playerStats.damage);
				break;
		}

		console.log(this.playerStats);
	}
}

class Upgrade {
	constructor(type, cost) {
		this.type = type;
		this.cost = cost;
	}

	toString() {
		switch(this.type) {
			case UPGRADE_TYPES.ROF_UP: return "Rate of fire up"
			case UPGRADE_TYPES.SS_UP: return "Shot speed up"
			case UPGRADE_TYPES.DMG_UP: return "Damage up"
		}
	}
}
