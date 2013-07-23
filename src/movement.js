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