precision mediump float;
uniform float time;
uniform vec2 resolution;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec2 uOrigin;
uniform float uTheta;
uniform float uRadius;
uniform vec2 uInShop;
uniform vec4 uEnemyPositions;

const int ps = 8; // use values > 1..10 for oldskool

const float PI = 3.14159265359;

void retroPlasma(void) {
	float x = (gl_FragCoord.x/resolution.x * 640.0);
    float y = (gl_FragCoord.y/resolution.y * 480.0);

    if (ps > 0) {
        x = float(int(x / float(ps)) * ps);
        y = float(int(y / float(ps)) * ps);
    }

    float t = time*5.0;

    float mov0 = x+y+sin(t)*10.+sin(x/90.)*70.+t*2.;
    float mov1 = (mov0 / 5. + sin(mov0 / 30.))/ 10. + t * 3.;
    float mov2 = mov1 + sin(mov1)*5. + t*1.0;
    float cl1 = sin(sin(mov1/4. + t)+mov1);
    float c1 = cl1 +mov2/2.-mov1-mov2+t;
    float c2 = sin(c1+sin(mov0/100.+t)+sin(y/57.+t/50.)+sin((x+y)/200.)*2.);
    float c3 = abs(sin(c2+cos((mov1+mov2+c2) / 10.)+cos((mov2) / 10.)+sin(x/80.)));

    float dc = float(16-ps);

    if (ps > 0) {
        cl1 = float(int(cl1*dc))/dc;
        c2 = float(int(c2*dc))/dc;
        c3 = float(int(c3*dc))/dc;
    }

    gl_FragColor = vec4(cl1,c2,c3,1.0);
}

float rand(vec2 co) {
	return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void outside(float distance) {
	// base color
	vec4 baseColor = vec4(1.0 - distance);
	baseColor.r *= 0.5;
	baseColor.b *= 0.5;
	baseColor *= 0.6;

	// noise
	float randomDelta = (rand(vTextureCoord + time*0.0001) * 2.0) - 1.0;
	vec4 noise = vec4(1);
	noise *= randomDelta;


	vec4 color = (baseColor*19.0 + noise) / 20.0;

	// scanlines
	/*
	vec2 modT = vec2(mod(time*0.1, 0.1)) - 0.05;
	vec2 modPos = vec2(mod(vTextureCoord, 0.1));
	vec2 dist =(modT - modPos)/0.1;
	color.r *= dist.x;
	color.g *= dist.x;
	*/

	gl_FragColor = color;
}

void main(void) {
	float s = sin(uTheta);
	float c = cos(uTheta);

    vec4 color = texture2D(uSampler, vec2(
		c*(vTextureCoord.x-uOrigin.x) - s*(vTextureCoord.y-uOrigin.y),
		s*(vTextureCoord.x-uOrigin.x) + c*(vTextureCoord.y-uOrigin.y)
	) + uOrigin);

	float distance = distance(vTextureCoord, uOrigin);
	if (distance < uRadius) {
        if (uInShop.x > 0.0) {
            //retroPlasma();
        } else {
            gl_FragColor = color;
        }
	} else if (distance < 0.5) {
		vec2 pos = vTextureCoord + time*4.0;
		gl_FragColor = vec4(1.0, 1.0, 1.0 - cos(pos.x + time)*cos(pos.y + time), 1.0);
	} else {
		outside(distance);
	}

	gl_FragColor.a = 1.0;
}

