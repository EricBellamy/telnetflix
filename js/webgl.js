WebGLCanvas = function () {
	this._canvas = null;
	this._gl = null;
	this._vertexBuffer = null;
	this._indexBuffer = null;
	this._vertexShader = null;
	this._fragmentShader = null;
	this._program = null;
	this._positionAttrib = 0;
	this._uvAttrib = 0;
	this._phaseLoc = null;
	this._phase = 0;
	this._phaseMultiplier = 0.055;
	this._phaseAddition = 0.003;
	this._phaseLimit = 2;
	this._timeLocation = null;

	// adjustable properties:
	this.animationSpeed = 1.2;

	this._initShaders();
	this._initTexture = this._initTexture.bind(this);

	this.init = function (canvasId, fillScreenSize) {
		this._init(canvasId, fillScreenSize);
	}.bind(this);

	this.startRender = function (callback) {
		this._canvas.style.zIndex = "20";
		this._phase = 0;
		self.requestAnimationFrame(this._render.bind(this));
		this.finishRenderCallback = callback;
	}
};

WebGLCanvas.prototype = {
	calculateSize: function (width, height) {
		let canvasWidth = width;
		let canvasHeight = height;
		if (canvasHeight < window.innerHeight) {
			canvasWidth = (window.innerHeight / canvasHeight) * canvasWidth;
			canvasHeight = window.innerHeight;
		}
		if (canvasWidth < window.innerWidth) {
			canvasHeight = (window.innerWidth / canvasWidth) * canvasHeight;
			canvasWidth = window.innerWidth;
		}
		return [canvasWidth, canvasHeight];
	},
	_init: function (canvasId, fillScreenSize) {
		this.fillScreenSize = fillScreenSize === true ? true : false;
		this._canvas = document.querySelector('#' + canvasId);
		if (!this._canvas) {
			this._canvas = document.createElement("canvas");
		}
		this._initWebGL();
		this.setShader(0);
		if (!this._gl) return;

		this._canvas.style.border = "none";
		this._canvas.id = canvasId;

		this._resize();
	},

	_initWebGL: function () {
		var webglFlags = { antialias: false, depth: false };
		this._gl = this._canvas.getContext('webgl', webglFlags) || this._canvas.getContext('experimental-webgl', webglFlags);
		if (!this._gl) {
			// UNSUPPORTED :: DOES NOT SUPPORT WEBGL
			return;
		}

		var vertices = [-1, 1, 0, 1,
			1, 1, 1, 1,
			1, -1, 1, 0,
		-1, -1, 0, 0];
		var indices = [0, 1, 2, 0, 2, 3];

		this._vertexBuffer = this._gl.createBuffer();
		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexBuffer);
		this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);

		this._indexBuffer = this._gl.createBuffer();
		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indices), this._gl.STATIC_DRAW);
	},

	_initTexture: function (img, wrap) {
		var texture = this._gl.createTexture();

		this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
		this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, 1);
		this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, img);

		this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
		this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);

		this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, wrap);
		this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, wrap);

		return texture;
	},

	_initProgram: function () {
		if (this._vertexShader) {
			this._gl.detachShader(this._program, this._vertexShader);
		}
		this._vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
		if (!this._initShader(this._vertexShader, WebGLCanvas.VERTEX_SHADER)) {
			console.warn("Failed generating vertex shader");
			return;
		}

		if (this._fragmentShader) {
			this._gl.detachShader(this._program, this._fragmentShader);
		}
		this._fragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
		if (!this._initShader(this._fragmentShader, WebGLCanvas.FRAGMENT_SHADER)) {
			console.warn("Failed generating fragment shader:");
			return;
		}

		this._program = this._gl.createProgram();

		this._gl.attachShader(this._program, this._vertexShader);
		this._gl.attachShader(this._program, this._fragmentShader);
		this._gl.linkProgram(this._program);

		if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)) {
			var log = this._gl.getProgramInfoLog(this._program);
			console.warn("Error in program linking:" + log);
			return;
		}

		this._positionAttrib = this._gl.getAttribLocation(this._program, "position");
		this._uvAttrib = this._gl.getAttribLocation(this._program, "texCoord");

		this._gl.useProgram(this._program);
		// var texLoc = this._gl.getUniformLocation(this._program, "displacementMap");
		// this._gl.uniform1i(texLoc, 1);

		var texLoc = this._gl.getUniformLocation(this._program, "primaryTexture");
		this._gl.uniform1i(texLoc, 0);

		texLoc = this._gl.getUniformLocation(this._program, "displacementMap");
		this._gl.uniform1i(texLoc, 1);

		texLoc = this._gl.getUniformLocation(this._program, "secondaryTexture");
		this._gl.uniform1i(texLoc, 2);

		this._phaseLoc = this._gl.getUniformLocation(this._program, "phase");
		this._timeLocation = this._gl.getUniformLocation(this._program, "u_time");
	},

	_initShader: function (shader, code) {
		this._gl.shaderSource(shader, code);
		this._gl.compileShader(shader);

		// Check the compile status, return an error if failed
		if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
			console.warn(this._gl.getShaderInfoLog(shader));
			return false;
		}

		return true;
	},

	_initShaders() {
		this.FRAGMENT_SHADERS = [
			[
				"precision highp float;" +
				"varying vec2 uv;",
				"uniform float u_time;",

				"uniform sampler2D primaryTexture;",

				"uniform float phase;",


				"void main()",
				"{",
				"	vec3 startColor = vec3(0.89,0.14,0.08);",
				"   vec4 imgColor = texture2D(primaryTexture, uv);",
				"	if(uv.x - (phase - 0.2) <= -1.0 * uv.y){",
				"	gl_FragColor = mix(vec4(imgColor.x, imgColor.y, imgColor.z, 1.0), vec4(0.0,0.0,0.0,1.0), 0.75);",
				"	} else if(uv.x - (phase - 0.1) <= -1.0 * uv.y){",
				"	gl_FragColor = mix(vec4(startColor.x, startColor.y, startColor.z, 1.0), mix(vec4(imgColor.x, imgColor.y, imgColor.z, 1.0), vec4(0.0,0.0,0.0,1.0), 0.75), 1.0 - (0.1 - (abs(-1.0 * uv.y - (uv.x - (phase))) - 0.1)) / 0.1);", // THIS IS BOTTOM LEFT HALF RED
				"	} else if(uv.x - phase <= -1.0 * uv.y){",
				"	", // Get the gradient fade here
				"	gl_FragColor = mix(vec4(startColor.x, startColor.y, startColor.z, 1.0), vec4(0.0,0.0,0.0,0.0), 1.0 - (0.1 - (abs((-1.0 * uv.y - (uv.x - (phase))) - 0.2)) + 0.1) / 0.1);", // THIS IS TOP RIGHT HALF RED
				"	} else { ",
				"	gl_FragColor = vec4(0.0,0.0,0.0,0.0);",
				"	}",
				"}",
			].join("\n"),
			[
				"precision highp float;" +
				"varying vec2 uv;",
				"uniform float u_time;",

				"uniform sampler2D primaryTexture;",
				"uniform sampler2D secondaryTexture;",

				"uniform float phase;",


				"void main()",
				"{",
				"	vec3 startColor = vec3(0.89,0.14,0.08);",
				"   vec4 imgColor = texture2D(primaryTexture, uv);",
				"   vec4 secondaryColor = texture2D(secondaryTexture, uv);",
				"	if(uv.x - (phase - 0.5) <= -1.0 * uv.y){",
				"	gl_FragColor = mix(vec4(imgColor.x, imgColor.y, imgColor.z, 1.0), vec4(0.0,0.0,0.0,1.0), 0.75);",
				"	} else if(uv.x - (phase - 0.25) <= -1.0 * uv.y){",// THIS IS BOTTOM LEFT HALF RED
				"	gl_FragColor = mix(mix(imgColor, vec4(0.0,0.0,0.0,0.5), 0.25), mix(imgColor, vec4(0.0,0.0,0.0,1.0), 0.75), 1.0 - (0.25 - (abs(-1.0 * uv.y - (uv.x - (phase))) - 0.25)) / 0.25);",
				"	} else if(uv.x - phase <= -1.0 * uv.y){", // THIS IS TOP RIGHT HALF RED
				"	gl_FragColor = mix(mix(imgColor, vec4(0.0,0.0,0.0,0.5), 0.25), mix(secondaryColor, vec4(0.0,0.0,0.0,0.5), 0.75), 1.0 - (0.25 - (abs((-1.0 * uv.y - (uv.x - (phase))) - 0.5)) + 0.25) / 0.25);",
				"	} else {",
				"	gl_FragColor = mix(secondaryColor, vec4(0.0,0.0,0.0,1.0), 0.75);",
				"	}",
				"}",
			].join("\n"),
			[
				"precision highp float;" +
				"varying vec2 uv;",
				"uniform float u_time;",

				"uniform sampler2D primaryTexture;",
				"uniform sampler2D displacementMap;",

				"uniform float phase;",

				"void main()",
				"{",
				"   vec4 primaryImg = texture2D(primaryTexture, uv);",
				"   vec4 displacementImg = texture2D(displacementMap, uv);",
				"	gl_FragColor = mix(vec4(0.0,0.0,0.0,0.0), primaryImg, min(phase, 1.0));",
				"}",
			].join("\n"),
			[
				"precision highp float;" +
				"varying vec2 uv;",
				"uniform float u_time;",

				"uniform sampler2D primaryTexture;",
				"uniform sampler2D secondaryTexture;",
				"uniform sampler2D displacementMap;",

				"uniform float phase;",

				"void main()",
				"{",
				"   vec4 primaryImg = texture2D(primaryTexture, uv);",
				"   vec4 secondaryImg = texture2D(secondaryTexture, uv);",
				"   vec4 displacementImg = texture2D(displacementMap, uv);",
				"	if(displacementImg.r > 1.0 - phase){",
				"	gl_FragColor = secondaryImg;",
				"	} else if(displacementImg.r > (1.0 - phase) - 0.03){",
				"	gl_FragColor = mix(secondaryImg, primaryImg, 0.5);",
				"	} else {",
				"	gl_FragColor = primaryImg;",
				"	}",
				"}",
			].join("\n")
		]
	},

	initTextures(primaryTexture, displacementMap, secondaryTexture) {
		let canvasSizes;
		if (primaryTexture) {
			if (this.fillScreenSize === true) {
				canvasSizes = this.calculateSize(primaryTexture.clientWidth, primaryTexture.clientHeight);
				this._canvas.style.width = canvasSizes[0] + "px";
				this._canvas.style.height = canvasSizes[1] + "px";
			}

			this._primaryTextureImg = primaryTexture;
			this._primaryTexture = this._initTexture(this._primaryTextureImg, this._gl.CLAMP_TO_EDGE);
		}
		if (displacementMap) {
			this._displacementMapImg = displacementMap;
			this._displacementMap = this._initTexture(this._displacementMapImg, this._gl.CLAMP_TO_EDGE);
		}
		if (secondaryTexture) {
			this._secondaryTextureImg = secondaryTexture;
			this._secondaryTexture = this._initTexture(this._secondaryTextureImg, this._gl.CLAMP_TO_EDGE);
		}

		this._resize();
	},

	setShader(shaderNum) {
		if (shaderNum != this.currentShader) {
			this.currentShader = shaderNum;
			WebGLCanvas.FRAGMENT_SHADER = this.FRAGMENT_SHADERS[shaderNum];

			this._initProgram();
			this._resize();
		}
	},

	setPhaseMultiplier(multiplier, phaseAddition, phaseLimit) {
		this._phaseMultiplier = multiplier;
		if (phaseAddition) {
			this._phaseAddition = phaseAddition;
		}
		if(phaseLimit){
			this._phaseLimit = phaseLimit;
		}
	},
	resetPhase() {
		this._phase = 0;
	},

	// This function should only ever be called on scroll, not constantly
	_render: function (timeStamp) {
		const scrollPercent = 0.5;
		const scrollTop = 500;
		if (this._phase < this._phaseLimit) {
			// if(this._phase < 0.5){
			self.requestAnimationFrame(this._render.bind(this));
		} else if (this.finishRenderCallback) {
			setTimeout(function () {
				this.finishRenderCallback();
			}.bind(this), 25);
		}

		var gl = this._gl;

		this._phase += this._phase * this._phaseMultiplier + this._phaseAddition;
		// this._phase = 0.75;

		this._gl.uniform1f(this._phaseLoc, this._phase * this.animationSpeed);

		gl.viewport(0, 0, this._canvas.clientWidth, this._canvas.clientHeight);

		//gl.clearColor(Math.random(), Math.random(), Math.random(), 1.0);
		//gl.clear(this._gl.COLOR_BUFFER_BIT);
		gl.useProgram(this._program);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);

		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);

		gl.vertexAttribPointer(this._positionAttrib, 2, gl.FLOAT, false, 16, 0);
		gl.vertexAttribPointer(this._uvAttrib, 2, gl.FLOAT, false, 16, 8);


		// Binds the textures to the display
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this._primaryTexture);

		if (this._displacementMap) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this._displacementMap);
		}

		if (this._secondaryTexture) {
			gl.activeTexture(gl.TEXTURE2);
			gl.bindTexture(gl.TEXTURE_2D, this._secondaryTexture);
		}

		// Draws the textures
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	},

	_resize: function () {
		var w = this._canvas.clientWidth === 0 ? window.innerWidth : this._canvas.clientWidth;
		var height = window.innerHeight;
		this._canvas.width = this._canvas.clientWidth;
		this._canvas.height = this._canvas.clientHeight;

		// this tries to get the pencil in clear view
		var diff = Math.min(window.innerHeight - height, 0.0);
		// this._canvas.style.top = diff+"px";
		this._gl.uniform2f(this._logoUVScaleLoc, this._canvas.width, this._canvas.height);
	}
};

WebGLCanvas.VERTEX_SHADER = [
	"precision highp float;" +
	"attribute vec4 position;",
	"attribute vec2 texCoord;",
	"uniform float phase;",

	"varying vec2 uv;",

	"void main()",
	"{",
	"   uv = texCoord;",
	"   gl_Position = position;",
	"}"
].join("\n");

window.webglBackground = new WebGLCanvas();

window.movieBackgroundImgs = document.querySelectorAll('.backgroundImage');
window.movieDisplacementImgs = document.querySelectorAll('.displacementMap');
window.webglBackground.init('webgl_intro_scroller', true);

window.moviePosterImgs = document.querySelectorAll('.posterImage');
window.webglPosterImage = new WebGLCanvas();
window.webglPosterImage.setPhaseMultiplier(0.08);
window.webglPosterImage.init('webglPosterImage');