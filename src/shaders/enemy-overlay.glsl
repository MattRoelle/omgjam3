precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 uColor;

void main(void) {
	vec4 texColor = texture2D(uSampler, vTextureCoord);
	if (texColor.a > 0.0 && uColor.a > 0.0) {
		gl_FragColor = uColor;
	} else {
		gl_FragColor = texColor;
	}
}
