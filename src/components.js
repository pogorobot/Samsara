//The Grid component allows an element to be located
//on a grid of tiles
Crafty.c('Grid', {
	init: function() {
		this.attr({
			w: Game.map_grid.tile.width,
			h: Game.map_grid.tile.height
		})
	},
	
	// Locate this entity at the given position on the grid
	at: function(x, y) {
		if (x === undefined && y === undefined) {
			return { x: this.x/Game.map_grid.tile.width, y: this.y/Game.map_grid.tile.height }
		}
		else {
			this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
			return this;
		}
	}
});

//An "Actor" is an entity that is drawn in 2D on canvas
//via our logical coordinate grid
Crafty.c('Actor', {
	init: function() {
		this.requires('2D, Canvas, Grid');
	},
});

// A Tree is just an Actor with a certain color
Crafty.c('Tree', {
	init: function() {
		this.requires('Actor, Solid, spr_tree, StopsBullets');
	},
});

// A Bush is just an Actor with a certain color
Crafty.c('Bush', {
	init: function() {
		this.requires('Actor, Solid, spr_bush');
	},
});

Crafty.c('Rock', {
	init: function() {
		this.requires('Actor, Solid, spr_rock, StopsBullets');
	},
});

Crafty.c('Enemy', {
	init: function() {
		this.requires('Actor, HurtsToTouch, Solid, Fleeing, Collectible, Chance')
		this.bind('EnterFrame', this.shootRandomly);
	},
	shoot: function() {
		var hero = Crafty('Hero');
		var distance = Crafty.math.distance(this.x, this.y, hero.x, hero.y);
		var speed = 1;
		var dy = speed * (hero.y - this.y) / distance;
		var dx = speed * (hero.x - this.x) / distance;
		var shootX = this.x;
		var shootY = this.y;
		if (dx > 0) {
			shootX += Game.map_grid.tile.width;
		}
		else if (dx < 0) {
			shootX -= Game.map_grid.tile.width;
		}
		else if (dy > 0) {
			shootY += Game.map_grid.tile.height;
		}
		else {
			shootY -= Game.map_grid.tile.height;
		}
		var bullet = Crafty.e('Bullet').setPos(shootX, shootY).setAngle(dx, dy);
	},
	loseHeart: function() {
		this.destroy();
	},
	shootRandomly: function() {
		if (this.chance(0.5)) this.shoot();
	},
});

Crafty.c('Chance', {
	chance: function(percent) {
		return Math.random() * 100 < percent;
	},
});

Crafty.c('HurtsToTouch', {
	init: function() {
		this.requires('Actor, Collision');
		this.onHit('Hero', this.touch);
		this.onHit('Enemy', this.touch);
	},
	
	touch: function(data) {
		bigShot = data[0].obj;
		//bigShot.getPushed(bigShot.x - this.x, bigShot.y - this.y);
		bigShot.loseHeart();
	},
});

Crafty.c('DeflectsBullets', {
	init: function() {
		this.requires('Actor, Collision');
		this.onHit('Bullet', this.bounce);
	},
	bounce: function(data) {
		var lucky = data[0].obj;
		var force = 0.5 //amount to push per frame once bounced
		lucky.bounce(this.rotation, force);
	},
});

Crafty.c('Sword', {
	wielder: Crafty('Hero'),
	init: function() {
		this.requires('Actor, spr_sword, Collision, SpriteAnimation, DeflectsBullets');
		this.animate('SwordSwinging',    0, 0, 4)
		this.onHit('Collectible', this.stab);
	},
	swing: function() {
		this.animate('SwordSwinging', 8, 0);
		//this.sheathe();
	},
	wieldedBy: function(wielder) {
		this.wielder = wielder;
		this.bind('EnterFrame', function() {
			this.attr({ x: wielder.x, y: wielder.y - Game.map_grid.tile.height});
		});
		this.origin(Game.map_grid.tile.width / 2, Game.map_grid.tile.height * 3 / 2);
		this.rotation = wielder.swordRotation;
		this.swing();
		this.bind('AnimationEnd', function() {
			if (!this.isPlaying('SwordSwingint')) {
				this.sheathe();
			}
		});
		return this;
	},
	stab: function(data)
	{
		villlage = data[0].obj;
		villlage.collect();
	},
	sheathe: function()
	{
		this.wielder.swordOut = false;
		this.destroy();
	},
});

Crafty.c('Heart', {
	init: function() {
		this.requires('Actor, spr_heart');
	},
	
	hurt: function() {
		this.destroy();
	},
});

Crafty.c('Swarming', {
	init: function() {
		this.requires('SwarmingOrFleeingBasics, HurtsToTouch');
		this.bind('EnterFrame', this.swarm);
		this.onHit('Hero', this.touch);
		this.onHit('Solid', this.stopMovement);
	},
});

Crafty.c('SwarmingOrFleeingBasics', {
	
	originalSpeed: 1,
	speed: this.originalSpeed,
	animation_speed: 2,
	dx: 0,
	dy: 0,
	fleeingFrom: Crafty('Hero'),
	
	init: function() {
		this.requires('Collision, spr_player, SpriteAnimation');
		this.animate('PlayerMovingUp',    0, 0, 2)
			.animate('PlayerMovingRight', 0, 1, 2)
			.animate('PlayerMovingDown',  0, 2, 2)
			.animate('PlayerMovingLeft',  0, 3, 2);
	},
	
	flee: function() {
		var newDx = this.dx;
		var newDy = this.dy;
		this.fleeingFrom = Crafty('Hero');
		this.speed = this.originalSpeed;
		newDy = this.speed / 2;
		if (this.fleeingFrom.y > this.y) {
			newDy = -newDy;
		}
		else if (this.fleeingFrom.y == this.y) {
			newDy = 0;
		}
		newDx = this.speed / 2;
		if (this.fleeingFrom.x > this.x) {
			newDx = -newDx;
		}
		else if (this.fleeingFrom.x == this.x) {
			newDx = 0;
		}
		this.y += newDy;
		this.x += newDx;
		if (newDy != this.dy || newDx != this.dx) {
			this.dy = newDy;
			this.dx = newDx;
			if (this.dx > 0) {
				this.animate('PlayerMovingRight', this.animation_speed, -1);
			}
			else if (this.dx < 0) {
				this.animate('PlayerMovingLeft', this.animation_speed, -1);
			}
			else if (this.dy > 0) {
				this.animate('PlayerMovingDown', this.animation_speed, -1);
			}
			else if (this.dy < 0) {
				this.animate('PlayerMovingUp', this.animation_speed, -1);
			}
			else {
				this.stop();
			}
		}
		return this;
	},
	
	stopMovement: function() {
		if (this.dx || this.dy) {
			this.x -= this.dx;
			if (this.hit('Solid') != false) {
				this.x += this.dx;
				this.y -= this.dy;
				if (this.hit('Solid') != false) {
					this.x -= this.dx;
					this.y -= this.dy;
				}
			}
		} else {
			this.speed = 0;
		}
		return this;
	},
	
	swarm: function() {
		var newDx = this.dx;
		var newDy = this.dy;
		this.fleeingFrom = Crafty('Hero');
		this.speed = this.originalSpeed;
		newDy = this.speed / 2;
		if (this.fleeingFrom.y < this.y) {
			newDy = -newDy;
		}
		else if (this.fleeingFrom.y == this.y) {
			newDy = 0;
		}
		newDx = this.speed / 2;
		if (this.fleeingFrom.x < this.x) {
			newDx = -newDx;
		}
		else if (this.fleeingFrom.x == this.x) {
			newDx = 0;
		}
		this.y += newDy;
		this.x += newDx;
		if (newDy != this.dy || newDx != this.dx) {
			this.dy = newDy;
			this.dx = newDx;
			if (this.dx > 0) {
				this.animate('PlayerMovingRight', this.animation_speed, -1);
			}
			else if (this.dx < 0) {
				this.animate('PlayerMovingLeft', this.animation_speed, -1);
			}
			else if (this.dy > 0) {
				this.animate('PlayerMovingDown', this.animation_speed, -1);
			}
			else if (this.dy < 0) {
				this.animate('PlayerMovingUp', this.animation_speed, -1);
			}
			else {
				this.stop();
			}
		}
		return this;
	},
});

Crafty.c('Fleeing', {
	
	init: function() {
		this.requires('SwarmingOrFleeingBasics');
		this.bind('EnterFrame', this.flee);
		this.onHit('Solid', this.stopMovement);
	},
});

Crafty.c('Bullet', {
	dy: 0,
	dx: 0,
	bounced: 0,
	init: function() {
		this.requires('Actor, Collision, spr_bullet, HurtsToTouch');
		this.bind('EnterFrame', function() {
			this.x += this.dx;
			this.y += this.dy;
		});
		this.onHit('StopsBullets', function() { this.destroy(); });
	},
	setAngle: function(dx, dy) {
		this.dy = dy;
		this.dx = dx;
		return this;
	},
	setPos: function (x, y) {
		this.x = x;
		this.y = y;
		return this;
	},
	bounce: function(rotation, force) { //in degrees, from vertical
		if (this.bounced) return;
		this.bounced = true;
		if (rotation == 0) { //bouncing up
			if (this.dy > 0) { //headed down
				this.dy *= -1;
			}
			this.dy -= force;
		}
		else if (rotation == 90) { //bouncing right
			if (this.dx < 0) { //headed left
				this.dx *= -1;
			}
			this.dx += force;
		}
		else if (rotation == 180) { //bouncing down
			if (this.dy < 0) {
				this.dy *= -1;
			}
			this.dy += force;
		}
		else { //bouncing left (or something weird!)
			if (this.x > 0) {
				this.dx *= -1;
			}
			this.dx -= force;
		}
	},
	//as if bouncing off a horizontal surface
	bounceHorizontally: function() {
		if (this.bounced) return; //only bounce once
		this.dy *= -1;
		this.bounced = true;
	},
	bounceVertically: function() {
		if (this.bounced) return; //only bounces once
		this.dx *= -1;
		this.bounced = true;
	},
	shove: function(shoveX, shoveY) {
		this.dx += shoveX;
		this.dy += shoveY;
	},
});



Crafty.c('Hero', {
	swordOut: true,
	swordRotation: 180,
	healthBar: [],
	maxHealth: 7,
	invulnerable: 0,
	init: function() {
		var speed = 2;
		
		var sword = Crafty.e('Sword').wieldedBy(this);
		this.requires('Actor, Solid, Fourway, Collision, spr_player, SpriteAnimation, Keyboard')
			.fourway(speed)
			//.onHit('Collectible', this.visitVillage)
			.stopOnSolids()
			.animate('PlayerMovingUp',    0, 0, 2)
			.animate('PlayerMovingRight', 0, 1, 2)
			.animate('PlayerMovingDown',  0, 2, 2)
			.animate('PlayerMovingLeft',  0, 3, 2);
		
		this.bind('KeyDown', function() {
			if (this.isDown('SPACE')) {
				if (this.swordOut) {
					sword.sheathe();
				}
				else {
					sword = Crafty.e('Sword').wieldedBy(this);
					this.swordOut = true;
				}
			}
		});
		var animation_speed = 4;
		this.bind('NewDirection', function(data) {
			if (data.x > 0) {
				this.animate('PlayerMovingRight', animation_speed, -1);
				this.swordRotation = 90;
			} else if (data.x < 0) {
				this.animate('PlayerMovingLeft', animation_speed, -1);
				this.swordRotation = 270;
			} else if (data.y > 0) {
				this.animate('PlayerMovingDown', animation_speed, -1);
				this.swordRotation = 180;
			} else if (data.y < 0) {
				this.animate('PlayerMovingUp', animation_speed, -1);
				this.swordRotation = 0;
			} else {
				this.stop();
			}
			sword.rotation = this.swordRotation;
		});
		
		var startPlacingHearts = Game.map_grid.width / 2 - 4;
		for (var i = 0; i < this.maxHealth; i++) {
			this.healthBar[i] = (Crafty.e('Heart').at(startPlacingHearts + i, 1));
		}
	},
	
	loseHeart: function() {
		if (this.invulnerable) return;
		this.healthBar[this.healthBar.length - 1].destroy();
		this.healthBar.length -= 1;
		Crafty.trigger('LostHeart', this);
		this.invulnerable = true;
		this.alpha = 0.5;
		this.timeout(function() { this.invulnerable = false; this.alpha = 1; }, 500);
	},
	
	getPushed: function(x, y) {
		if (this.invulnerable) return;
		this.x += x;
		this.y += y;
	},
	
	stopOnSolids: function() {
		this.onHit('HurtsToTouch', this.loseHeart);
		this.onHit('Solid', this.stopMovement);
		return this;
	},
	
	stopMovement: function() {
		this._speed = 0;
		if (this._movement) {
			this.x -= this._movement.x;
			this.y -= this._movement.y;
		}
	},
	visitVillage: function(data) {
		villlage = data[0].obj;
		villlage.collect();
	},
});

// A village is a tile on the grid that the PC must visit in order to win the game
Crafty.c('Village', {
	init: function() {
		this.requires('Actor, Solid, spr_village, Collectible');
	},
	
});

Crafty.c('Collectible', {
	collect: function() {
		this.destroy();
		Crafty.audio.play('knock');
		Crafty.trigger('VillageVisited', this);
	}
});