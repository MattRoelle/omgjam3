function initEnemyOverlayShader(s) {
	Phaser.Filter.EnemyOverlay = function(game) {
    	Phaser.Filter.call(this, game);

		this.uniforms.uColor = { type: "4f", value: {  x: 0, y: 0, z: 0, w: 0 } };

		this.fragmentSrc = s;
	};

	Phaser.Filter.EnemyOverlay.prototype = Object.create(Phaser.Filter.prototype);
	Phaser.Filter.EnemyOverlay.prototype.constructor = Phaser.Filter.EnemyOverlay;

	Object.defineProperty(Phaser.Filter.EnemyOverlay.prototype, "colorR", {
    	get: function() {
        	return this.uniforms.uColor.value.x;
    	},
    	set: function(value) {
        	this.dirty = true;
        	this.uniforms.uColor.value.x = value;
    	}
	});

	Object.defineProperty(Phaser.Filter.EnemyOverlay.prototype, "colorG", {
    	get: function() {
        	return this.uniforms.uColor.value.y;
    	},
    	set: function(value) {
        	this.dirty = true;
        	this.uniforms.uColor.value.y = value;
    	}
	});

	Object.defineProperty(Phaser.Filter.EnemyOverlay.prototype, "colorB", {
    	get: function() {
        	return this.uniforms.uColor.value.z;
    	},
    	set: function(value) {
        	this.dirty = true;
        	this.uniforms.uColor.value.z = value;
    	}
	});

	Object.defineProperty(Phaser.Filter.EnemyOverlay.prototype, "colorA", {
    	get: function() {
        	return this.uniforms.uColor.value.w;
    	},
    	set: function(value) {
        	this.dirty = true;
        	this.uniforms.uColor.value.w = value;
    	}
	});
}
