function initWorldShader(s) {
	Phaser.Filter.WorldRotation = function(game) {

    	Phaser.Filter.call(this, game);

		this.uniforms.uEnemyPositions = { type: "4f", value: { x: 0.1, y: 2, z: 0.3, w: 3 } };
		this.uniforms.uOrigin = { type: "2f", value: { x: 0, y: 0 } };
		this.uniforms.uTheta = { type: "1f", value: 0.5 };
		this.uniforms.uRadius = { type: "1f", value: 0.5 };

		this.fragmentSrc = s;
	};

	Phaser.Filter.WorldRotation.prototype = Object.create(Phaser.Filter.prototype);
	Phaser.Filter.WorldRotation.prototype.constructor = Phaser.Filter.WorldRotation;

	Object.defineProperty(Phaser.Filter.WorldRotation.prototype, "originY", {
    	get: function() {
        	return this.uniforms.uOrigin.value.y;
    	},
    	set: function(value) {
        	this.dirty = true;
        	this.uniforms.uOrigin.value.y = value;
    	}
	});

	Object.defineProperty(Phaser.Filter.WorldRotation.prototype, "originX", {
    	get: function() {
        	return this.uniforms.uOrigin.value.x;
    	},
    	set: function(value) {
        	this.dirty = true;
        	this.uniforms.uOrigin.value.x = value;
    	}
	});

	Object.defineProperty(Phaser.Filter.WorldRotation.prototype, "theta", {
    	get: function() {
        	return this.uniforms.uTheta.value;
    	},
    	set: function(value) {
        	this.dirty = true;
        	this.uniforms.uTheta.value = value;
    	}
	});
}
