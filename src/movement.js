//Deals specifically with components that allow living things to move around on the game canvas

Crafty.c('MovesAround', {
	dx: 0,
	dy: 0,
	speed: 1,
	init: function() {
		this.requires('Actor');
		this.bind('EnterFrame', this.move);
	},
	move: function() {
		if (this.has('Grabbed')) return;
		if (this.has('Stunned')) return;
		if (this.has('Slowed')) {
			this.x += this.dx / 2;
			this.y += this.dy / 2;
		}
		else {
			this.x += this.dx;
			this.y += this.dy;
		}
	},
	turn: function(newDx, newDy) {
		this.dx = newDx;
		this.dy = newDy;
		if (this.has('DontShowTurning')) return;
		if (this.has('DirectionalAnimation')) {
			this.animateNewDirection(this.xyToDirection(newDx, newDy));
		}
		else {
			this.rotation = Math.atan2(this.dy, this.dx) * 180 / Math.PI;
		}
		if (this.has('CanSwingASword')) {
			this.swordRotation = this.directionToDegrees[this.xyToDirection(newDx, newDy)];
		}
	},
	//thingToChase must have x, y, w, h
	chase: function(thingToChase) {
		//aim for the center
		var target = { x: thingToChase.x + thingToChase.w / 3, y: thingToChase.y + thingToChase.h / 3 };
		var distance = Crafty.math.distance(this.x, this.y, target.x, target.y);
		//how that translates to vert and horizontal speeds
		newDy = Math.round(this.speed * (target.y - this.y) * 10 / distance) / 10;
		newDx = Math.round(this.speed * (target.x - this.x) * 10 / distance) / 10;
		this.turn(newDx, newDy);
	},
	turnAround: function() {
		this.turn(-this.dx, -this.dy);
	},
	xyToDirection: function(dx, dy) {
		if (Math.abs(dx) > Math.abs(dy)) {
			if (dx > 0) return "Right";
			else return "Left";
		}
		else {
			if (dy > 0) return "Down";
			else return "Up";
		}
	},
	directionToDegrees: { "Up": 0, "Down": 180, "Right": 90, "Left": 270 },
});

Crafty.c('DirectionalAnimation', {
	stillFrames: false,
	animationDuration: 4,
	//Define what happens 
	setDirectionAnimations: function(up, down, right, left, frames) {
		if (frames) {
			this.requires('SpriteAnimation');
			this.animate("Up", up.x, up.y, frames)
				.animate("Down", down.x, down.y, frames)
				.animate("Right", right.x, right.y, frames)
				.animate("Left", left.x, left.y, frames);
		}
		else {
			this.stillFrames = true;
			this.upSprite = up;
			this.downSprite = down;
			this.rightSprite = right;
			this.leftSprite = left;
		}
	},
	animateNewDirection: function(newDirection) {
		if (this.stillFrames) {
			if (newDirection == "Up") {
				this.requires(this.upSprite);
			}
			else if (newDirection == "Down") {
				this.requires(this.downSprite);
			}
			else if (newDirection == "Right") {
				this.requires(this.rightSprite);
			}
			else if (newDirection == "Left") {
				this.requires(this.leftSprite);
			}
		}
		else {
			this.animate(newDirection, this.animationDuration, -1);
		}
	},
});	

Crafty.c('Orbits', {
	radius: 24,
	orbitalSpeed: 5, //in degrees
	init: function() {
		this.requires('DontShowTurning');
	},
	orbit: function(planet) {
		this.orbitingAround = planet;
		this.x = planet.x + planet.w / 3;
		this.y = planet.y + planet.h / 3;
		this.y += this.radius;
		this.origin(this.w / 2, this.h / 2  - this.radius);
		planet.attach(this);
		this.bind('EnterFrame', function() {
			this.rotation += this.orbitalSpeed;
		});
	},
	spiralDownward: function(speed) {
		this.requires('Falling, Collision');
		if (!speed) speed = 0.5;
		this.bind('EnterFrame', function() {
			if (this.radius > 0) {
				this.radius -= speed;
				this.origin(this.w / 2, this.h / 2 - this.radius);
				this.y -= speed;
			}
			if (this.radius < this.orbitingAround.h / 2) {
				this.orbitingAround.gainHealth(1);
				this.destroy();
			}
		});
	},
	headToward: function(target) {
		this.orbitingAround.detach(this);
		this.requires("MovesAround");
		this.speed = 3;
		this.chase(target);
		this.target = target;
		this.bind('EnterFrame', this.straightenUp);
		this.requires('HurtsMonsters');
		this.attackPower = 2;
		this.bind('HurtSomething', this.destroy);
		this.onHit('StopsBullets', this.destroy);
	},
	straightenUp: function() {
		var straightenSpeed = 0.5;
		if (this.radius > this.w) {
			this.radius -= straightenSpeed;
			this.origin(this.w / 2, this.h / 2 - this.radius);
			this.y -= straightenSpeed;
		}
		else {
			this.chase(this.target);
			this.unbind('EnterFrame', this.straightenUp);
		}
	}
});