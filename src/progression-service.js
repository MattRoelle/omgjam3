const UPGRADE_TYPES = {
	ROF_UP: 1,
	SS_UP: 2,
	DMG_UP: 3,
	SPEED_UP: 4,
	RANGE_UP: 5,
	ACC_UP: 6,
	HP_UP: 7
};

class ProgressionService {
	constructor() {
		this.waveNumber = 0;

		this.credits = 0;

		this.playerStats = {
			rateOfFire: { value: 450, level: 1 },
			shotSpeed: { value: 600, level: 1 },
			damage: { value: 5, level: 1},
			range: { value: 400, level: 1 },
			speed: { value: 11, level: 1 },
			accuracy: { value: 0.3, level: 1 },
			hp:  { value: 1, level: 1 }
		};
	}

	setWave(n) {
		this.waveNumber = n;
	}

	getCost(typ) {
		const baseCost = 0;
		switch(typ) {
			case UPGRADE_TYPES.ROF_UP: return baseCost + (this.playerStats.rateOfFire.level*100)*2.5;
			case UPGRADE_TYPES.SS_UP: return baseCost + (this.playerStats.shotSpeed.level*100)*2;
			case UPGRADE_TYPES.DMG_UP: return baseCost + (this.playerStats.damage.level*this.playerStats.damage.level)*50;
			case UPGRADE_TYPES.RANGE_UP: return baseCost + (this.playerStats.range.level*100)*2;
			case UPGRADE_TYPES.SPEED_UP: return baseCost + (this.playerStats.speed.level*100)*2;
			case UPGRADE_TYPES.ACC_UP: return baseCost + (this.playerStats.accuracy.level*100)*2;
			case UPGRADE_TYPES.HP_UP: return baseCost + (this.playerStats.hp.level*this.playerStats.hp.level)*100;
		}
	}

	getUpgradeOptions() {

		const upgrades = [];

		if (this.playerStats.rateOfFire.level < 7) {
			upgrades.push(new Upgrade(
				UPGRADE_TYPES.ROF_UP,
				this.getCost(UPGRADE_TYPES.ROF_UP),
				this.playerStats.rateOfFire.level
			));
		}

		if (this.playerStats.shotSpeed.level < 4) {
			upgrades.push(new Upgrade(
				UPGRADE_TYPES.SS_UP,
				this.getCost(UPGRADE_TYPES.SS_UP),
				this.playerStats.shotSpeed.level
			));
		}

		if (this.playerStats.speed.level < 3) {
			upgrades.push(new Upgrade(
				UPGRADE_TYPES.SPEED_UP,
				this.getCost(UPGRADE_TYPES.SPEED_UP),
				this.playerStats.speed.level
			));
		}

		if (this.playerStats.range.level < 3) {
			upgrades.push(new Upgrade(
				UPGRADE_TYPES.RANGE_UP,
				this.getCost(UPGRADE_TYPES.RANGE_UP),
				this.playerStats.range.level
			));
		}

		if (this.playerStats.accuracy.level < 3) {
			upgrades.push(new Upgrade(
				UPGRADE_TYPES.ACC_UP,
				this.getCost(UPGRADE_TYPES.ACC_UP),
				this.playerStats.accuracy.level
			));
		}

		upgrades.push(new Upgrade(
			UPGRADE_TYPES.DMG_UP, 
			this.getCost(UPGRADE_TYPES.DMG_UP),
			this.playerStats.damage.level
		));

		upgrades.push(new Upgrade(
			UPGRADE_TYPES.HP_UP, 
			this.getCost(UPGRADE_TYPES.HP_UP),
			this.playerStats.hp.level
		));

		return upgrades;
	}

	purchaseUpgrade(upgrade) {
		if (this.credits - upgrade.cost < 0) return false;

		upgrade.currentLevel++;
		this.credits -= upgrade.cost;

		switch(upgrade.type) {
			case UPGRADE_TYPES.ROF_UP:
				this.playerStats.rateOfFire.value -= 70;
				this.playerStats.rateOfFire.level++;
				upgrade.valid = upgrade.currentLevel < 7;
				break;
			case UPGRADE_TYPES.SS_UP:
				this.playerStats.shotSpeed.value += 50;
				this.playerStats.shotSpeed.level++;
				upgrade.valid = upgrade.currentLevel < 4;
				break;
			case UPGRADE_TYPES.DMG_UP:
				this.playerStats.damage.value *= 1.6; 
				this.playerStats.damage.value = Math.round(this.playerStats.damage.value);
				this.playerStats.damage.level++;
				upgrade.valid = true;
				break;
			case UPGRADE_TYPES.SPEED_UP:
				this.playerStats.speed.value += 2
				this.playerStats.speed.level++;
				upgrade.valid = upgrade.currentLevel < 3;
				break;
			case UPGRADE_TYPES.RANGE_UP:
				this.playerStats.range.value += 150
				this.playerStats.range.level++;
				upgrade.valid = upgrade.currentLevel < 3;
				break;
			case UPGRADE_TYPES.ACC_UP:
				this.playerStats.accuracy.value -= 1.5;
				this.playerStats.accuracy.level++;
				upgrade.valid = upgrade.currentLevel < 3;
				break;
			case UPGRADE_TYPES.HP_UP:
				this.playerStats.hp.value++;
				this.playerStats.hp.level++;
				upgrade.valid = true;
				break;
		}

		upgrade.cost = this.getCost(upgrade.type);

		return true;
	}

	getEnemies() {
		const ret = [];
		const n = this.waveNumber*1.333;
		const nEnemies = Math.min(25, (n*0.75) + (Math.random()*n*0.25)) + 1;

		while(ret.length < nEnemies) {
			ret.push(
				Math.random() < 0.5
					? BasicEnemy
					: BouncerEnemy
			);
		}

		return ret;
	}
}

class Upgrade {
	constructor(type, cost, currentLevel) {
		this.type = type;
		this.cost = cost;
		this.currentLevel = currentLevel;
		this.valid = true;
	}

	toString() {
		switch(this.type) {
			case UPGRADE_TYPES.ROF_UP: return "Rate of fire - Lv" + this.currentLevel;
			case UPGRADE_TYPES.SS_UP: return "Shot speed - Lv" + this.currentLevel;
			case UPGRADE_TYPES.DMG_UP: return "Damage - Lv" + this.currentLevel;
			case UPGRADE_TYPES.RANGE_UP: return "Range - Lv" + this.currentLevel;
			case UPGRADE_TYPES.SPEED_UP: return "Speed - Lv" + this.currentLevel;
			case UPGRADE_TYPES.ACC_UP: return "Accuracy - Lv" + this.currentLevel;
			case UPGRADE_TYPES.HP_UP: return "HP - Lv" + this.currentLevel;
		}
	}
}
