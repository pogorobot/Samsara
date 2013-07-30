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
		var sigFigs = 1;
		if (this.has('Enemy')) sigFigs = 0;
		//aim for the center
		var target = { x: thingToChase.x + thingToChase.w / 3, y: thingToChase.y + thingToChase.h / 3 };
		var distance = Crafty.math.distance(this.x, this.y, target.x, target.y);
		//how that translates to vert and horizontal speeds
		newDy = Math.round(this.speed * (target.y - this.y) * Math.pow(10, sigFigs) / distance) / Math.pow(10, sigFigs);
		newDx = Math.round(this.speed * (target.x - this.x) * Math.pow(10, sigFigs) / distance) / Math.pow(10, sigFigs);
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

//So you ran into a wall.
//Maybe all is not lost?
//Here we cancel out only that part of the movement that actually keeps us touching solids
//Somewhat slow, currently
Crafty.c('StopsAtWalls', {
	
	init: function() {
		this.requires('Collision');
		this.onHit('Solid', this.stopMovement);
	},
	stopMovement: function() {
		if (this.has('Grabbed')) return;
		if (this.has('Stunned')) return;
		if (this.dx || this.dy) {
			//First try undoing the x move we did
			this.x -= this.dx;
			if (this.hit('Solid') != false) { //didn't work (we're still touching a solid)
				//redo the x move and try undoing the y
				this.x += this.dx;
				this.y -= this.dy;
				if (this.hit('Solid') != false) {
					//also didn't work, crap
					this.x -= this.dx;
				}
			}
		}
		return this;
	},
});

Crafty.c('Swarming', {
	init: function() {
		this.requires('MovesAround, HurtsToTouch, StopsAtWalls, Delay');
		this.swarm();
	},
	swarm: function() {
		this.chase(Crafty('Hero'));
		this.delay(this.swarm, 1000);
	},
});


Crafty.c('Fleeing', {
	init: function() {
		this.requires('MovesAround, HurtsToTouch, StopsAtWalls, Delay');
		this.flee();
	},
	flee: function() {
		this.chase(Crafty('Hero'));
		this.turnAround();
		this.delay(this.flee, 1000);
	},
});

//Not currently in use.
Crafty.c('GetsShoved', {
	dx: 0,
	dy: 0,
	init: function() {
		this.requires('Collision');
		this.onHit('Solid', this.stopAllMovement);
	},
	roll: function() {
		if (this.x || this.y) {
			this.x += this.dx;
			this.y += this.dy;
		}
	},
	stopAllMovement: function() {
		this.x -= this.dx;
		this.y -= this.dy;
		this.dx = 0;
		this.dy = 0;
		this.unbind('EnterFrame', this.roll);
	},
});