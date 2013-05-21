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
		this.requires('Actor, Solid, spr_tree');
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
		this.requires('Actor, Solid, spr_rock');
	},
});

Crafty.c('Enemy', {
	init: function() {
		this.requires('Actor, Solid, spr_player, SpriteAnimation, Fleeing, Collectible');
		this.animate('PlayerMovingDown', 0, 2, 2);
		this.animate('PlayerMovingDown', 7, -1);
	},
});

Crafty.c('Sword', {
	wielder: Crafty('Hero'),
	init: function() {
		this.requires('Actor, spr_sword, Collision');
		this.onHit('Collectible', this.stab);
	},
	wieldedBy: function(wielder) {
		this.wielder = wielder;
		this.bind('EnterFrame', function() {
			this.attr({ x: wielder.x, y: wielder.y - Game.map_grid.tile.height});
		});
		this.origin(Game.map_grid.tile.width / 2, Game.map_grid.tile.height * 3 / 2);
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

Crafty.c('Fleeing', {
	
	originalSpeed: 1,
	speed: this.originalSpeed,
	dx: 0,
	dy: 0,
	fleeingFrom: Crafty('Hero'),
	
	init: function() {
		//this.requires('Collision, Collectible')
		this.requires('Collision');
		this.bind('EnterFrame', this.flee);
		this.onHit('Solid', this.stopMovement);
	},
	
	flee: function() {
		this.fleeingFrom = Crafty('Hero');
		this.speed = this.originalSpeed;
		this.dy = this.speed / 2;
		if (this.fleeingFrom.y < this.y) {
			this.dy = -this.dy;
		}
		this.dx = this.speed / 2;
		if (this.fleeingFrom.x < this.x) {
			this.dx = -this.dx;
		}
		this.y += this.dy;
		this.x += this.dx;
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
	}
});



Crafty.c('Hero', {
	swordOut: true,
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
				sword.rotation = 90;
			} else if (data.x < 0) {
				this.animate('PlayerMovingLeft', animation_speed, -1);
				sword.rotation = 270;
			} else if (data.y > 0) {
				this.animate('PlayerMovingDown', animation_speed, -1);
				sword.rotation = 180;
			} else if (data.y < 0) {
				this.animate('PlayerMovingUp', animation_speed, -1);
				sword.rotation = 0;
			} else {
				this.stop();
			}
		});
	},
	
	stopOnSolids: function() {
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