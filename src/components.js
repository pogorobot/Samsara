//====================
//TOP LEVEL COMPONENTS
//====================

// (Which are mostly just collections of other components)
// These are what you make entities out of!

// A Tree is just an Actor with a certain sprite (that is solid and stops bullets)
Crafty.c('Tree', {
	init: function() {
		this.requires('Actor, Solid, spr_tree, StopsBullets, Terrain');
	},
});

//A wall forms the boundaries of a Room, and comes in four rotated varieties.
Crafty.c('Wall', {
	init: function() {
		this.requires('Actor, Solid, spr_wall, StopsBullets, Terrain');
	},
	setRotation: function(rotation) {
		this.origin(this.w / 2, this.h / 2);
		this.rotation = rotation;
		return this;
	},
});

Crafty.c('RightWall', {
	init: function() {
		this.requires('Wall');
		this.setRotation(90);
	},
});

Crafty.c('BottomWall', {
	init: function() {
		this.requires('Wall');
		this.setRotation(180);
	},
});

Crafty.c('LeftWall', {
	init: function() {
		this.requires('Wall');
		this.setRotation(270);
	},
});

// Floor is currently unused due to lag.
Crafty.c('Floor', {
	init: function() {
		this.requires('Actor, spr_floor, Terrain');
	},
});

Crafty.c('Block', {
	init: function() {
		this.requires('Actor, Solid, spr_block, StopsBullets, Terrain');
	},
});

// A Bush is just an Actor with a certain sprite (that is solid)
Crafty.c('Bush', {
	init: function() {
		this.requires('Actor, Solid, spr_bush, Terrain');
	},
});

Crafty.c('Doorway', {
	init: function() {
		this.requires('Terrain');
		this.bind('DoorsClose', function() {
			if (!this.room.cleared()) {
				this.requires('Door');
			}
		});
	}
});

Crafty.c('RightDoorway', {
	init: function() {
		this.requires('Terrain');
		this.bind('DoorsClose', function() {
			if (!this.room.cleared()) {
				this.requires('RightDoor');
			}
		});
	}
});
Crafty.c('BottomDoorway', {
	init: function() {
		this.requires('Terrain');
		this.bind('DoorsClose', function() {
			if (!this.room.cleared()) {
				this.requires('BottomDoor');
			}
		});
	}
});
Crafty.c('LeftDoorway', {
	init: function() {
		this.requires('Terrain');
		this.bind('DoorsClose', function() {
			if (!this.room.cleared()) {
				this.requires('LeftDoor');
			}
		});
	}
});

Crafty.c('Door', {
	init: function() {
		this.requires('Actor, Solid, spr_door, StopsBullets, Terrain');
		this.bind('DoorsOpen', function() {
			this.destroy();
		});
	},
	setRotation: function(rotation) {
		this.origin(this.w / 2, this.h / 2);
		this.rotation = rotation;
		return this;
	},
});

Crafty.c('RightDoor', {
	init: function() {
		this.requires('Door');
		this.setRotation(90);
	},
});

Crafty.c('BottomDoor', {
	init: function() {
		this.requires('Door');
		this.setRotation(180);
	},
});

Crafty.c('LeftDoor', {
	init: function() {
		this.requires('Door');
		this.setRotation(270);
	},
});

//A Rock is a Solid Actor that stops bullets
Crafty.c('Rock', {
	init: function() {
		this.requires('Actor, Solid, spr_rock, StopsBullets, Terrain');
	},
});

Crafty.c('Placeholder', {
	init: function() {
		this.requires('Terrain');
	},
});

Crafty.c('MegaMap', {
	contents: [],
	width: 5,
	height: 5,
	init: function() {
		for (var x = 0; x < this.width; x++) {
			this.contents[x] = new Array(this.height);
			for (var y = 0; y < this.height; y++) {
				this.contents[x][y] = 0;
			}
		}
		this.makeRooms();
		this.placeDoors();
	},
	makeRooms: function() {
		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				this.contents[x][y] = this.whatGoesAt(x, y);
			}
		}
		return this;
	},
	whatGoesAt: function(x, y) {
		return Crafty.e('Room').populate();
	},
	placeDoors: function() {
		var chanceOfDoor = 0.7;
		for (var x = 0; x < this.width - 1; x++) {
			for (var y = 0; y < this.height - 1; y++) {
				if (Math.random() < chanceOfDoor) {
					//these functions return just where they placed it (chosen randomly if undefined)
					this.contents[x+1][y].putDoorOnLeft(this.contents[x][y].putDoorOnRight());
				}
				if (Math.random() < chanceOfDoor || !this.contents[x][y].placedOneDoor) {
					this.contents[x][y+1].putDoorOnTop(this.contents[x][y].putDoorOnBottom());
				}
			}
		}
	},
	placeHero: function(roomX, roomY) {
		//select a randomly chosen room
		if (roomX === undefined || roomY === undefined) {
			roomX = Math.floor(Math.random() * this.width);
			roomY = Math.floor(Math.random() * this.height);
			room = this.contents[roomX][roomY];
			room.leaveEmpty(Game.player.at().x, Game.player.at().y);
		}
		this.roomX = roomX;
		this.roomY = roomY;
		room = this.contents[roomX][roomY];
		room.display();
		if (!room.cleared()) {
			Game.player.doorsWillClose();
			Game.player.triggerDoors();
		}
	},
});

//Rooms keep track of everything that shows up on a given screen!
Crafty.c('Room', {
	width: Game.map_grid.width,
	height: Game.map_grid.height,
	init: function() {
		this.contents = new Array(this.width);
		for (var x = 0; x < this.width; x++) {
			this.contents[x] = new Array(this.height);
			for (var y = 0; y < this.height; y++) {
				this.contents[x][y] = false;
			}
		}
		this.placedOneVillage = false;
		this.placedOneDoor = false;
		this.maxSpawningVillages = 5;
		this.spawningVillageCount = 0;
	},
	cleared: function() {
		return !Crafty('Collectible').length;
	},
	leaveEmpty: function(x, y) {
		this.contents[x][y] = 'Placeholder';
		return this;
	},
	populate: function() {
		for (var x = this.width-1; x >= 0; x--) {
			for (var y = this.height-1; y >= 0; y--) {
				this.contents[x][y] = this.whatGoesAt(x, y);
			}
		}
		if (!this.placedOneVillage) {
			do {
				x = Math.ceil(Math.random() * this.width - 2);
				y = Math.ceil(Math.random() * this.height - 2);
			}
			while (this.contents[x][y]);
			this.contents[x][y] = 'SpawningVillage';
		}
		return this;
	},
	whatGoesAt: function(x, y) {
		if (this.contents[x][y])    {
               return this.contents[x][y];
        }
		var atTop = y == 0;
		var atBottom = y == this.height - 1;
		var atLeft = x == 0;
		var atRight = x == this.width - 1;
		var atEdge = atTop || atBottom || atLeft || atRight;
		if (atEdge) {
			if (atTop) {
				if (atLeft || atRight) {
					return 'Block';
				}
				else {
					return 'Wall';
				}
			}
			else if (atBottom) {
				if (atLeft || atRight) {
					return 'Block';
				}
				else {
					return 'BottomWall';
				}
			}
			else if (atLeft) {
				return 'LeftWall';
			}
			else if (atRight) {
				return 'RightWall';
			}
		}
		else if (Math.random() < 0.06 && !this.contents[x][y]) {
			// Place a bush entity at the current tile
			return (Math.random() > 0.3) ? 'Bush' : 'Rock';
		} //else if (Math.random() < 0.03 && !this.contents[x][y]) {
			//return "Enemy";
		 else if (Math.random() < 0.02 && !this.contents[x][y] && !this.contents[x][y+1]) {
			if (this.spawningVillageCount < this.maxSpawningVillages){
				this.placedOneVillage = true;
				this.spawningVillageCount++;
				return "SpawningVillage";
			}	
			else {
				return "Village";
			}	
		}
		else {
			return false;
		}
	},
	display: function() {
		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				if (this.contents[x][y]) {
					Crafty.e(this.contents[x][y]).at(x, y).placeInRoom(this);
				}
			}
		}
		return this;
	},
	putDoorOnTop: function(x) {
		if (x === undefined) {
			//pick a random x between 1 and width - 2 (not a corner)
			x = Math.floor(Math.random() * (this.width - 2)) + 1;
		}
		this.contents[x][0] = 'Doorway';
		this.contents[x][1] = false; //Don't block the door
		this.placedOneDoor = true;
		return x;
	},
	putDoorOnRight: function(y) {
		if (y === undefined) {
			y = Math.floor(Math.random() * (this.height - 2)) + 1;
		}
		this.contents[this.width - 1][y] = 'RightDoorway';
		this.contents[this.width - 2][y] = false;
		this.placedOneDoor = true;
		return y;
	},
	putDoorOnBottom: function(x) {
		if (x === undefined) {
			//pick a random x between 1 and width - 2 (not a corner)
			x = Math.floor(Math.random() * (this.width - 2)) + 1;
		}
		this.contents[x][this.height - 1] = 'BottomDoorway';
		this.contents[x][this.height - 2] = false;
		this.placedOneDoor = true;
		return x;
	},
	putDoorOnLeft: function(y) {
		if (y === undefined) {
			y = Math.floor(Math.random() * (this.height - 2)) + 1;
		}
		this.contents[0][y] = 'LeftDoorway';
		this.contents[1][y] = false;
		this.placedOneDoor = true;
		return y;
	},
});

Crafty.c("Camera",{
    init: function() {  },
    camera: function(obj) {
      this.set(obj);
      var that = this;
      obj.bind("Moved",function(location) { that.set(location); });
    },
    set: function(obj) {
      Crafty.viewport.x = -obj.x + Crafty.viewport.width / 2;
      Crafty.viewport.y = -obj.y + Crafty.viewport.height / 2;
    }
 });


//Enemy Component
//---------------
// Enemies are collectibles which are distinguished from terrain by some sort of behaviour, handled in separate components.
Crafty.c('Enemy', {
	init: function() {
		this.requires('Actor, Solid, Collectible, Chance, ShootsAtPlayer')
	},
	//What happens when you get hit with something that hurts (e.g., bullets)
	//Currently nothing
	loseHeart: function() {
		//this.destroy();
	},
});

//FleeingEnemies are generic cowardly enemies, running away from the Hero while firing bullets.
Crafty.c('FleeingEnemy', {
	init: function() {
		this.requires('Enemy, ShootsAtPlayer, Fleeing')
	},
});

//SwarmingEnemies are generic enemies that bum-rush and attempt to shiv the Hero, while also firing bullets.
Crafty.c('SwarmingEnemy', {
	init: function() {
		this.requires('Enemy, Swarming, ShootsAtPlayer, SwingSwordRandomly')
	},
});

//Hero Component
//--------------
//Here you have it: The player's avatar
//Needs to have its behavior devolved to separate components for superior abstaction
//Is currently kind of a mess of everything I wanted to be able to do
Crafty.c('Hero', {
	swordOut: false, 		//So we don't swing our sword if we're already swinging our sword
	swordRotation: 180, 	//To keep track of where the sword should swing
	invulnerable: false,	//So we don't take damage just after taking damage
	init: function() {
		var speed = 2;
		
		//Requirements:   Actor (exists on a grid), Solid (enemies don't walk through  you), 
						//Fourway, Collision, Keyboard (various interface functionality), 
						//spr_player, SpriteAnimation (for your appearance)
		this.requires('Actor, Solid, Fourway, Collision, HasHealth, CanHeal, CanSwingASword, spr_player, SpriteAnimation, Keyboard, ThinksAboutMurder')
			.fourway(speed)			//Crafty method to grant keyboard control
			.animate('PlayerMovingUp',    0, 0, 2)	//Define various animations
			.animate('PlayerMovingRight', 0, 1, 2)	//arguments are: reel name, row and column on spritesheet, duration
			.animate('PlayerMovingDown',  0, 2, 2)
			.animate('PlayerMovingLeft',  0, 3, 2);
			
		this.onHit('HurtsToTouch', this.loseHeart); //If you cut me, do I not bleed?
		this.onHit('Solid', this.stopMovement);		//If I walk into a wall, do I not stop moving?
													//Note: Do not reverse the order of those.
		
		//Define what happens when we swing a sword
		var sword = Crafty.e('Sword').wieldedBy(this); //We'll want to keep track of it so we can rotate it when we change direction
		this.bind('KeyDown', function() {
			if (this.isDown('SPACE')) {
				this.swingSword();
			}
		});
		
		//Define what happens when we change direction
		//(i.e., change our animation and rotate our sword)
		var animation_speed = 4; //More properly, animation_duration... (ie, the two frames of animation will run for four frames)
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
				this.stop(); //Don't animate if we're not moving
			}
			sword.rotation = this.swordRotation; //If we already have a sword onscreen, rotate it (otherwise does nothing)
		});
		this.bind('EnterFrame', function() {
			if (this.x < -this.w / 2) {
				this.x += Game.width();
				Crafty.trigger('WentLeft');
			}
			if (this.x > Game.width() - this.w / 2) {
				this.x -= Game.width();
				Crafty.trigger('WentRight');
			}
			if (this.y < -this.h / 2) {
				this.y += Game.height();
				Crafty.trigger('WentUp');
			}
			if (this.y > Game.height() - this.h / 2) {
				this.y -= Game.height();
				Crafty.trigger('WentDown');
			}
		});
	},
	
	doorsWillClose: function() {
		this.bind('Moved', function() {
			this.triggerDoors();
		});
	},
	
	triggerDoors: function(){
		if (this.insideWallEdge())
			{
				Crafty.trigger('DoorsClose');
				this.unbind('Moved', this.doorsWillClose);
			};
	},
	
	insideWallEdge: function() {
		return this.x > this.w && this.y > this.h && this.x < Game.width() - (2*this.w) && this.y < Game.height() - (2 * this.h);
	},
	
	//When we get hurt
	loseHeart: function() {
		if (this.invulnerable) return; //If we're invulnerable, pain don't hurt
		var heartToLose;
		//If we have a fractional heart,
		if (Crafty('HalfHeart').length) {
			heartToLose = Crafty('HalfHeart'); //The halfheart will be gone
			Crafty.e('BrokenHeart').at(heartToLose.tileX, heartToLose.tileY); //and replace it with an empty one
		}
		else {
			heartToLose = this.healthBar[this.healthBar.length - 1]; //The last heart will be fractional'd
			this.healthBar.length -= 1; //Take it out of the health bar as well as the game
			Crafty.e('HalfHeart').at(heartToLose.tileX, heartToLose.tileY); //Put a fractional heart in its place
		}
		heartToLose.destroy(); //Delete whichever object we've designated
		Crafty.trigger('LostHeart', this); //Trigger an event so the game knows we may have just died
		this.invulnerable = true;			//Trigger invulnerability so we just get hurt once
		this.alpha = 0.4;					//Trigger a visual representation of invulnerability
		//Wait half a second, then go back to normal
		this.timeout(function() { this.invulnerable = false; this.alpha = 1; }, 500);
	},
	
	//Not currently in use (didn't work)
	getPushed: function(x, y) {
		if (this.invulnerable) return;
		this.x += x;
		this.y += y;
	},
	
	//Gets called when you touch something solid
	//These _properties are part of the Fourway component
	stopMovement: function() {
		this._speed = 0;
		if (this._movement) {
			this.x -= this._movement.x;
			if (this.hit('Solid') != false) {
				this.x += this._movement.x;
				this.y -= this._movement.y;
				if (this.hit('Solid') != false) {
					this.x -= this._movement.x;
					if (this.hit('Solid') != false) {
						this.x += this._movement.x;
						this.y += this._movement.y;
					}
				}
			}
		}
	},
});

Crafty.c('Sentinel', {
	dx: 0,
	dy: 0,
	init: function() {
		this.requires('Actor, Solid, StopsAtWalls, Collectible');
		if (Math.random() < .5) {
			if (Math.random() < .5) {
				this.dx = 1;
				this.requires("spr_sentinel_right");
			}
			else {
				this.dx = -1;
				this.requires("spr_sentinel_left");
			}
		}
		else {
			if (Math.random() < .5) {
				this.dy = 1;
				this.requires("spr_sentinel_down");
			}
			else {
				this.dy = -1;
				this.requires("spr_sentinel_up");
			}
		}
		this.bind('EnterFrame', this.moveAlong);
		this.onHit('Solid', this.stopMovement);
	},
	
	moveAlong: function() {
		this.x += this.dx;
		this.y += this.dy;
	},
});

Crafty.c('StealsLife', {
	init: function() {
		this.requires('Weapon');
		this.bind('VillageVisited', this.stealLife);
	},
	stealLife: function() {
		if (this.wielder.has('CanHeal')) {
			this.wielder.heal();
		}
	},
});

Crafty.c('ThinksAboutMurder', {
	bodyCount: 0,
	init: function() {
		this.bind('VillageVisited', function() {
			this.bodyCount++;
			Game.think(this.bodyCount);
		});
	},
});

//To-Do: Abstract most of this to a Weapon component
// (then make more weapons in Pickle)
Crafty.c('Sword', {
	init: function() {
		this.requires('Actor, spr_sword, Collision, SpriteAnimation, Weapon, StealsLife');
		this.animate('SwordSwinging',    0, 0, 4)
		this.alpha = 0;
	},
	swing: function() {
		this.alpha = 1;
		this.animate('SwordSwinging', 8, 0);
	},
	wieldedBy: function(wielder) {
		this.wielder = wielder;
		this.attr({ x: wielder.x, y: wielder.y - wielder.h});
		
		this.bind('EnterFrame', function() {
			this.attr({ x: wielder.x, y: wielder.y - wielder.h});
		});
		//offset our center of rotation to the center of the wielder
		this.origin(wielder.w / 2, wielder.h * 3 / 2);
		this.rotation = wielder.swordRotation;
		this.swing();
		this.bind('AnimationEnd', function() { //Revisit if we add more animations
			this.sheathe();
		});
		if (this.wielder.has('Hero')) {
			this.requires('HurtsMonsters, DeflectsBullets');
		}
		else {
			this.requires('HurtsToTouch');
		}
		return this;
	},
	sheathe: function()
	{
		this.wielder.swordOut = false;
		this.destroy();
	},
});

Crafty.c('HurtsMonsters', {
	init: function() {
		this.onHit('Collectible', this.stab);
	},
	stab: function(data)
	{
		collectible = data[0].obj;
		collectible.collect();
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
		// dx and dy are rounded to the number of decimal places given by aimFidelity
		// higher aimFidelity = better accuracy, but worse performance
		var aimFidelity = 1;
		this.dy = Math.round((dy) * Math.pow(10, aimFidelity))/(Math.pow(10, aimFidelity));
		this.dx = Math.round((dx) * Math.pow(10, aimFidelity))/(Math.pow(10, aimFidelity));
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
		this.removeComponent('spr_bullet');
		this.addComponent('spr_deflectedBullet');
		this.removeComponent('HurtsToTouch');
		this.addComponent('HurtsMonsters');
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

Crafty.c('Heart', {
	init: function() {
		this.requires('Actor, spr_heart');
	},
	
	hurt: function() {
		this.destroy();
	},
});


Crafty.c('BrokenHeart', {
	init: function() {
		this.requires('Actor, spr_emptyHeart');
	}
});

Crafty.c('HalfHeart', {
	init: function() {
		this.requires('Actor, spr_halfHeart');
	}
});

// A village is a tile on the grid that the PC must destroy in order to complete a room.
Crafty.c('Village', {
	init: function() {
		this.requires('Actor, Solid, spr_village, Collectible, Terrain');
	},
});

Crafty.c('SpawningVillage', {
	init: function() {
		this.requires('Village, SpawnPoint');
	},
});


// ==================
// LOGICAL COMPONENTS
// ==================

// (Which define various behaviors)

Crafty.c('ShootsAtPlayer', {
	init: function() {
		this.requires('Actor, Chance');
		this.bind('EnterFrame', this.shootRandomly);
	},
	shoot: function() {
		var hero = Crafty('Hero');
		var distance = Crafty.math.distance(this.x, this.y, hero.x, hero.y);
		//the speed of the projectile in px per frame
		var speed = 1.5;
		//how that translates to vert and horizontal speeds
		var dy = speed * (hero.y - this.y) / distance;
		var dx = speed * (hero.x - this.x) / distance;
		//here we decide where to start the projectile
		var shootX = this.x;
		var shootY = this.y;
		if (dx > 0) {
			shootX += this.w;
		}
		else if (dx < 0) {
			shootX -= this.w;
		}
		else if (dy > 0) {
			shootY += this.h;
		}
		else {
			shootY -= this.h;
		}
		//now that we have our position and direction, spawn a bullet
		Crafty.e('Bullet').setPos(shootX, shootY).setAngle(dx, dy);
	},
	shootRandomly: function() {
		var maxBullets = 5;
		if (Crafty("Bullet").length < maxBullets && this.chance(0.5)) this.shoot();
	},
});

Crafty.c('CanSwingASword', {
	swordOut: false,
	swordRotation: 180, 	//To keep track of where the sword should swing
	init: function() {
		this.requires('Actor');
	},
	swingSword: function() {
		if (this.swordOut) return;
		Crafty.e('Sword').wieldedBy(this);
		this.swordOut = true;
	},
	changeDirectionOfSword: function(newDirection) {
		this.swordRotation = newDirection;
	},
});

Crafty.c('SwingSwordRandomly', {
	init: function() {
		this.requires('CanSwingASword, Chance');
		this.bind('EnterFrame', function() {
			if (this.chance(1)) {
				this.swingSword();
			}
		});
	},
});

//If the player touches it, some health is lost
//Currently does nothing to anything else
Crafty.c('HurtsToTouch', {
	init: function() {
		this.requires('Actor, Collision');
		this.onHit('Hero', this.touch);
		this.onHit('Enemy', this.touch); //To-do: abstract this, a-la Collectible
	},
	
	touch: function(data) {
		target = data[0].obj;
		//target.getPushed(target.x - this.x, target.y - this.y);
		target.loseHeart();
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


Crafty.c('SwarmingOrFleeingBasics', {
	
	originalSpeed: 1,
	speed: this.originalSpeed,
	animation_speed: 2,
	dx: 0,
	dy: 0,
	fleeingFrom: Crafty('Hero'),
	fleeing: true,
	
	init: function() {
		this.requires('Collision, spr_villager, SpriteAnimation, StopsAtWalls');
		//For the uninitiated: .animate comes from the SpriteAnimation component. Here we're defining reels
		//.animate with four arguments defines reels, and .animate with three arguments plays them. Obviously.
		//Here we're saying the 'PlayerMovingUp' reel should be the two frames starting at 0,0 in our sprite component (spr_villager)
		this.animate('PlayerMovingUp',    0, 0, 2)
			.animate('PlayerMovingRight', 0, 1, 2)
			.animate('PlayerMovingDown',  0, 2, 2)
			.animate('PlayerMovingLeft',  0, 3, 2);
	},
	
	//TAKES ALL THE CPUs
	move: function() {
		var newDx = this.dx;
		var newDy = this.dy;
		this.fleeingFrom = Crafty('Hero'); //Remember what we're headed toward, or away from
		this.speed = this.originalSpeed;
		
		//Figure out where we're moving
		var distance = Crafty.math.distance(this.x, this.y, this.fleeingFrom.x, this.fleeingFrom.y);
		//how that translates to vert and horizontal speeds
		newDy = Math.round(this.speed * (this.fleeingFrom.y - this.y) / distance);
		newDx = Math.round(this.speed * (this.fleeingFrom.x - this.x) / distance);
		if (this.fleeing) {
			newDy = -newDy;
			newDx = -newDx;
		}
		
		//Do the moving
		this.y += newDy;
		this.x += newDx;
		
		//Animate the moving
		if (newDy != this.dy || newDx != this.dx) {
			this.dy = newDy;
			this.dx = newDx;
			if (Math.abs(newDy) > Math.abs(newDx)) {
				if (newDy > 0) {
					if (this.has('CanSwingASword')) this.swordRotation = 180;
					this.animate('PlayerMovingDown', this.animation_speed, -1);
				}
				else {
					if (this.has('CanSwingASword')) this.swordRotation = 0;
					this.animate('PlayerMovingUp', this.animation_speed, -1);
				}
			}
			else {
				if (newDx > 0) {
					if (this.has('CanSwingASword')) this.swordRotation = 90;
					this.animate('PlayerMovingRight', this.animation_speed, -1);
				}
				else {
					if (this.has('CanSwingASword')) this.swordRotation = 270;
					this.animate('PlayerMovingLeft', this.animation_speed, -1);
				}
			}
		}
		return this;
	},
	
	flee: function() {
		this.fleeing = true;
		return this.move();
	},
	
	
	
	swarm: function() {
		this.fleeing = false;
		return this.move();
	},
});

Crafty.c('StopsAtWalls', {//So you ran into a wall.
	//Maybe all is not lost?
	//Here we cancel out only that part of the movement that actually keeps us touching solids
	//Somewhat slow, currently
	
	init: function() {
		this.requires('Collision');
	},
	stopMovement: function() {
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
		} //else {
			//this.speed = 0;
		//}
		
		return this;
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


Crafty.c('Fleeing', {
	init: function() {
		this.requires('SwarmingOrFleeingBasics');
		this.bind('EnterFrame', this.flee);
		this.onHit('Solid', this.stopMovement);
	},
});

Crafty.c('HasHealth', {
	healthBar: [],			//Holds the Heart components that show up atop the screen
	maxHealth: 3,			//In full Hearts
	init: function() {
		//Put a health bar onscreen
		var xOfFirstHeart = Game.map_grid.width / 2 - this.maxHealth / 2;
		for (var i = 0; i < this.maxHealth; i++) {
			this.healthBar[i] = (Crafty.e('Heart').at(xOfFirstHeart + i, 1));
		}
	},
});

Crafty.c('CanHeal', {
	init: function() {
		this.requires('HasHealth');
	},
	
	heal: function() {
		if (this.healthBar.length >= this.maxHealth) return;
		if (Crafty('HalfHeart').length) {
			this.healthBar.push(Crafty.e('Heart').at(Crafty('HalfHeart').tileX, Crafty('HalfHeart').tileY));
			Crafty('HalfHeart').destroy();
		}
		else {
			Crafty('BrokenHeart').each(function() {
				heartToGain = this;
			});
			Crafty.e('HalfHeart').at(heartToGain.tileX, heartToGain.tileY);
			heartToGain.destroy();
		}
	},
});

//This component randomly spawns new enemies
Crafty.c('SpawnPoint', {
	probability: 0.2,
	init: function() {
		this.requires('Terrain, Chance');
		this.bind('EnterFrame', this.thinkAboutSpawning);
	},
	thinkAboutSpawning: function() {
		var maxCollectibles = 10;
		var chanceOfSentinel = 33;
		if (Crafty('Enemy').length + Crafty('SpawningVillage').length < maxCollectibles && this.chance(this.probability)) {
			if (this.chance(chanceOfSentinel)) {
				var newGuy = Crafty.e('Sentinel').at(this.tileX, this.tileY + 1);
			}
			else if (this.chance(50)) {
				var newGuy = Crafty.e('FleeingEnemy').at(this.tileX,this.tileY+1);
			}
			else {
				var newGuy = Crafty.e('SwarmingEnemy').at(this.tileX, this.tileY+1);
			}
			if (newGuy.hit('Solid')) {
				newGuy.destroy();
			}
		}
	},
});

Crafty.c('Terrain', {
	init: function() {
		this.requires('Actor');
	},
	placeInRoom: function(room) {
		this.room = room;
	}
});

Crafty.c('Collectible', {
	init: function() {
		this.requires('Actor');
	},
	collect: function() {
		this.destroy();
		Crafty.audio.play('knock');
		Crafty.trigger('VillageVisited', this);
		if (this.has('Terrain')) {
			this.eraseFromRoom();
		}
	},
	eraseFromRoom: function() {
		this.room.contents[this.at().x][this.at().y] = false;
	},
});


//Here so I can define boolean chance events in percentages
Crafty.c('Chance', {
	chance: function(percent) {
		return Math.random() * 100 < percent;
	},
});

// ====================
// INTERFACE COMPONENTS
// ====================

// (Which mostly have to do with visuals)

//The Grid component allows an element to be located
//on a grid of tiles
Crafty.c('Grid', {
	tileX: 0,
	tileY: 0,
	init: function() {
		this.attr({
			w: Game.map_grid.tile.width,
			h: Game.map_grid.tile.height
		})
	},
	
	// Locate this entity at the given position on the grid
	at: function(x, y) {
		//at() means you're asking
		if (x === undefined && y === undefined) {
			return { x: Math.round(this.x/this.w), y: Math.round(this.y/this.h) }
		}
		//at(here) means you're telling
		else {
			this.attr({ x: x * this.w, y: y * this.h, tileX: x, tileY: y });
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
