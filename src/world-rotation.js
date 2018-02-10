Phaser.Filter.WorldRotation = function(game) {

    Phaser.Filter.call(this, game);

	this.uniforms.uOrigin = { type: "2f", value: { x: 0, y: 0 } };
	this.uniforms.uTheta = { type: "1f", value: 0.5 };
	this.uniforms.uRadius = { type: "1f", value: 0.5 };

    this.fragmentSrc = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "uniform sampler2D uSampler;",
		"uniform vec2 uOrigin;",
		"uniform float uTheta;",
		"uniform float uRadius;",

        "void main(void)",
        "{",
			"float s = sin(uTheta);",
			"float c = cos(uTheta);",
            "vec4 color = texture2D(uSampler, vec2(",
				"c*(vTextureCoord.x-uOrigin.x) - s*(vTextureCoord.y-uOrigin.y)",
				",",
				"s*(vTextureCoord.x-uOrigin.x) + c*(vTextureCoord.y-uOrigin.y)",
			") + uOrigin);",
			"float distance = distance(vTextureCoord, uOrigin);",
			"if (distance < uRadius) {",
				"gl_FragColor = color;",
			"} else {",
				"gl_FragColor = vec4(0, 0, 0, 1);",
			"}",
        "}"
    ];
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

