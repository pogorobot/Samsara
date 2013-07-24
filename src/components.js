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

Crafty.c('Corner', {
	init: function() {
		this.requires('Wall, spr_corner');
	},
});

Crafty.c('TopRightCorner', {
	init: function() {
		this.requires('Corner');
		this.setRotation(0);
	},
});

Crafty.c('BottomRightCorner', {
	init: function() {
		this.requires('Corner');
		this.setRotation(90);
	},
});

Crafty.c('BottomLeftCorner', {
	init: function() {
		this.requires('Corner');
		this.setRotation(180);
	},
});

Crafty.c('TopLeftCorner', {
	init: function() {
		this.requires('Corner');
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

Crafty.c('Placeholder', {
	init: function() {
		this.requires('Terrain');
	},
});

Crafty.c("Camera", {
    init: function() {  },
    camera: function(obj) {
      this.set(obj);
      var that = this;
      obj.bind("Moved", function(location) { that.set(location); });
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
		this.requires('Actor, Solid, Alive, Collectable, StaysInRoom')
		this.health = 2;
	},
});

//FleeingEnemies are generic cowardly enemies, running away from the Hero while firing bullets.
Crafty.c('FleeingEnemy', {
	init: function() {
		this.requires('Enemy, Fleeing, ShootsAtPlayer, spr_villager, DirectionalAnimation');
		this.setDirectionAnimations(
			{x: 0, y: 0}, //up
			{x: 0, y: 2}, //down
			{x: 0, y: 1}, //right
			{x: 0, y: 3}, //left
			2); //two frames each
	},
});

//SwarmingEnemies are generic enemies that bum-rush and attempt to shiv the Hero, while also firing bullets.
Crafty.c('SwarmingEnemy', {
	init: function() {
		this.requires('Enemy, Swarming, ShootsAtPlayer, SwingSwordRandomly, spr_villager, DirectionalAnimation');
		this.setDirectionAnimations(
			{x: 0, y: 0}, //up
			{x: 0, y: 2}, //down
			{x: 0, y: 1}, //right
			{x: 0, y: 3}, //left
			2); //two frames each
	},
});

Crafty.c('SwingSwordOnSpace', {
	init: function() {
		this.requires('CanSwingASword, Keyboard');
		//Define what happens when we swing a sword
		this.bind('KeyDown', function() {
			if (this.isDown('SPACE')) {
				this.swingSword();
			}
			if (this.isDown('F')) {
				Crafty.e('DeathGrip').shootFrom(this);
			}
			if (this.isDown('P')) {
				Crafty.pause();
			}
			if (this.isDown('C')) {
				Crafty('Arrow').destroy();
				Crafty.e('Arrow').setRotation(this.swordRotation).at(this.at().x, this.at().y);
			}
		});
	},
});

Crafty.c('Arrow', {
	init: function() {
		this.requires('Actor, spr_arrow, Collision, Terrain');
		this.z = -1;
		this.onHit('Marching', function(data) {
			var marcher = data[0].obj;
			if (this.at().x == marcher.at().x && this.at().y == marcher.at().y) {
				marcher.turn(this.rotation);
			}
		});
		this.origin(this.w/2, this.h/2);
		return this;
	},
	setRotation: function(rotation) {
		this.rotation = rotation;
		return this;
	},
});

Crafty.c('UpArrow', {
	init: function() {
		this.requires('Arrow');
		this.setRotation(0);
	}
});

Crafty.c('DownArrow', {
	init: function() {
		this.requires('Arrow');
		this.setRotation(180);
	}
});
Crafty.c('RightArrow', {
	init: function() {
		this.requires('Arrow');
		this.setRotation(90);
	}
});
Crafty.c('LeftArrow', {
	init: function() {
		this.requires('Arrow');
		this.setRotation(270);
	}
});

//Hero Component
//--------------
//Here you have it: The player's avatar
//Needs to have its behavior devolved to separate components for superior abstaction
//Is currently kind of a mess of everything I wanted to be able to do
Crafty.c('Hero', {
	animation_duration: 4, //in frames
	movementSpeed: 2,
	init: function() {
		//Requirements:   Actor (exists on a grid), Solid (enemies don't walk through  you), 
						//Fourway, Collision, Keyboard (various interface functionality), 
						//spr_player, SpriteAnimation (for your appearance)
		this.requires('Actor, Alive, Solid, Fourway, Collision, HasHealthBar, SwingSwordOnSpace, spr_player, SpriteAnimation, Keyboard')
			.fourway(this.movementSpeed)			//Crafty method to grant keyboard control
			.animate('PlayerMovingUp',    0, 0, 2)	//Define various animations
			.animate('PlayerMovingRight', 0, 1, 2)	//arguments are: reel name, row and column on spritesheet, number of frames
			.animate('PlayerMovingDown',  0, 2, 2)
			.animate('PlayerMovingLeft',  0, 3, 2);
			
		this.onHit('HurtsToTouch', this.getHurt);
		this.onHit('Solid', this.stopMovement);		//If I walk into a wall, do I not stop moving?
													//Note: Do not reverse the order of those.
		
		//Define what happens when we change direction
		//(i.e., change our animation and rotate our sword)
		this.bind('NewDirection', function(data) {
			if (data.x > 0) {
				this.animate('PlayerMovingRight', this.animation_duration, -1);
				this.swordRotation = 90;
			} else if (data.x < 0) {
				this.animate('PlayerMovingLeft', this.animation_duration, -1);
				this.swordRotation = 270;
			} else if (data.y > 0) {
				this.animate('PlayerMovingDown', this.animation_duration, -1);
				this.swordRotation = 180;
			} else if (data.y < 0) {
				this.animate('PlayerMovingUp', this.animation_duration, -1);
				this.swordRotation = 0;
			} else {
				this.stop(); //Don't animate if we're not moving
			}
			if (this.sword) this.sword.rotation = this.swordRotation; //If we already have a sword onscreen, rotate it (otherwise does nothing)
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
		this.unbind('Moved', this.triggerDoors); //Don't want to bind stuff twice!
		this.bind('Moved', this.triggerDoors);
	},
	
	triggerDoors: function(){
		if (this.insideWallEdge()) {
			Crafty.trigger('DoorsClose');
			this.unbind('Moved', this.triggerDoors);
			//this.unbind('Moved');  //Alternate fix for binding issue
		}
	},
	
	insideWallEdge: function() {
		return this.x >= this.w && this.y >= this.h && this.x <= Game.width() - (2*this.w) && this.y <= Game.height() - (2 * this.h);
	},
	
	//Gets called when you touch something solid
	//These _properties are part of the Fourway component
	stopMovement: function() {
		this._speed = 0;
		//Here we try to not get stuck in a wall.
		if (this._movement) {
			//try reverting only the x motion
			this.x -= this._movement.x;
			if (this.hit('Solid') != false) {
				//That didn't work, so try reverting only the y motion
				this.x += this._movement.x;
				this.y -= this._movement.y;
				if (this.hit('Solid') != false) {
					//That also didn't work, so revert all motion
					this.x -= this._movement.x;
					if (this.hit('Solid') != false) {
						//Wait, we must have been stuck beforehand. Fuck it. Just keep walking through walls.
						this.x += this._movement.x;
						this.y += this._movement.y;
					}
				}
			}
		}
	},
});

Crafty.c('DeathGrip', {
	turned: false,
	init: function() {
		this.requires('Actor, spr_deathGrip, Collision, Delay, MovesAround');
		this.speed = 3;
		this.origin(this.w / 2, this.h / 2); //set origin to center
		this.onHit('StopsBullets', this.detachThenDestroy);
		return this;
	},
	shootFrom: function(lifestealer) {
		this.master = lifestealer;
		this.rotation = this.master.swordRotation - 90; //sprites are rotated 90 degrees
		this.movementRotation = this.master.swordRotation;
		this.x = this.master.x + this.master.w / 3;
		this.y = this.master.y + this.master.h / 3;
		this.dx = this.speed * Math.sin(this.movementRotation * Math.PI / 180); //sine because rotation starts from vertical
		this.dy = this.speed * -Math.cos(this.movementRotation * Math.PI / 180);
		this.onHit('Enemy', function (data) {
			enemy = data[0].obj;
			this.grab(enemy);
		});
		this.delay(this.boomerang, 300);
	},
	courseCorrect: function() {
		this.chase(this.master);
	},
	grab: function(enemy) {
		if (enemy.has("Grabbed")) return;
		enemy.requires('Grabbed');
		this.attach(enemy);
		enemy.delay(function() {
			enemy.removeComponent('Grabbed');
			if (enemy._parent) {
				enemy._parent.detach(enemy);
			}
		}, 2000);
		this.boomerang();
	},
	boomerang: function() {
		this.bind('EnterFrame', this.courseCorrect);
		this.onHit('Hero', function(data) {
			hero = data[0].obj;
			this.transferTo(hero);
		});
	},
	detachThenDestroy: function() {
		this.detach();
		this.destroy();
	},
	transferTo: function(hero) {
		for (var i = 1; i < this._children.length; i++) {
			hero.attach(this._children[1]);
		}
		this.detachThenDestroy();
	},
});


Crafty.c('Sentinel', {
	init: function() {
		this.requires('Enemy, HurtsToTouch, StopsAtWalls, Marching, MovesAround, DirectionalAnimation');
		this.health = 4;
		this.painfulness = 2;
		
		this.setDirectionAnimations("spr_sentinel_up", "spr_sentinel_down", "spr_sentinel_right", "spr_sentinel_left");
		if (Math.random() < .5) {
			if (Math.random() < .5) {
				this.turn(1, 0);
			}
			else {
				this.turn(-1, 0);
			}
		}
		else {
			if (Math.random() < .5) {
				this.turn(0, 1);
			}
			else {
				this.turn(0, -1);
			}
		}
	},
});

Crafty.c('StealsLife', {
	init: function() {
		this.requires('Weapon');
	},
	stealLife: function() { //this should only trigger when Hero is wielding the blade, but that doesn't seem to be the case right now.
		if(this.wielder.has('HasHealthBar')) this.wielder.setHealthBar(this.wielder.health + this.attackPower);
		Crafty.e('SoulOrb');
	},
});

Crafty.c('ThinksAboutMurder', {
	bodyCount: 0,
	init: function() {
		this.bind('Collected', function() {
			this.bodyCount++;
			Game.think(this.bodyCount);
		});
	},
});


//To-Do: Abstract most of this to a Weapon component
// (then make more weapons in Pickle)
Crafty.c('Sword', {
	init: function() {
		this.requires('Actor, spr_sword, Collision, SpriteAnimation, Weapon');
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
			this.requires('HurtsMonsters, DeflectsBullets, StealsLife');
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
	attackPower: 1,
	init: function() {
		this.onHit('Collectable', this.stab);
	},
	stab: function(data)
	{
		collectable = data[0].obj;
		collectable.loseHealth(this.attackPower);
		if (this.has('PoisonTouch')) collectable.requires('Poisoned');
		if(collectable.health <= 0){
			if(this.has("StealsLife")) {
				if (collectable.has("Alive")) {
					this.stealLife();
					//this.wielder.setHealthBar(this.wielder.health + this.attackPower); 
					//Each sword instance only steals life once
					this.removeComponent("StealsLife");
				}
			}
			collectable.collect();
		}
	},
});

Crafty.c('ChargingBullet', {
	init: function() {
		this.requires('Actor, spr_bullet, SpriteAnimation');
		this.animate('Charging', 2, 0, 6);
		this.animate('Charging', 24, 0);
		this.bind('AnimationEnd', this.finishCharging);
		return this;
	},
	setPos: function(x, y) {
		this.x = x;
		this.y = y;
		return this;
	},
	finishCharging: function(data) {
		Crafty.e('Bullet').setPos(this.x, this.y).chase(Crafty('Hero'));
		this.destroy();
	},
});

Crafty.c('Bullet', {
	bounced: 0,
	init: function() {
		this.requires('Actor, Collision, spr_bullet, HurtsToTouch, StaysInRoom, MovesAround, CausesSlowed');
		this.onHit('StopsBullets', function() { this.destroy(); });
		this.speed = 3;
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
});

Crafty.c('SoulOrb', {
	init: function() {
		this.requires('Actor, spr_soulOrb, Collision, Orbits');
		this.orbit(Crafty('Hero'));
		this.onHit('Bullet', function(data) {
			var bullet = data[0].obj;
			bullet.destroy();
			this.destroy();
		});
		this.z = 75;
	},
});

Crafty.c('FullHeart', {
	init: function() {
		this.requires('Heart, spr_heart');
	},
});

Crafty.c('BrokenHeart', {
	init: function() {
		this.requires('Heart, spr_emptyHeart');
	}
});

Crafty.c('HalfHeart', {
	init: function() {
		this.requires('Heart, spr_halfHeart');
	}
});


// A village is a tile on the grid that the PC must destroy in order to complete a room.
Crafty.c('Village', {
	init: function() {
		this.requires('Actor, Solid, spr_village, Collectable, Terrain');
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
		this.requires('Actor');
		this.bind('EnterFrame', this.shootRandomly);
	},
	shoot: function() {
		if (this.has("Grabbed")) return;
		if (this.has("Stunned")) return;
		if (this.has("Disarmed")) return;
		var hero = Crafty('Hero');
		var shootX = this.x + this.w / 3;
		var shootY = this.y + this.h / 3;
		if (hero.x > this.x) {
			shootX += this.w;
		}
		else if (hero.x < this.x) {
			shootX -= this.w;
		}
		else if (hero.y > this.y) {
			shootY += this.h;
		}
		else {
			shootY -= this.h;
		}
		//now that we have our position and direction, spawn a bullet
		this.attach(Crafty.e('ChargingBullet').setPos(shootX, shootY));
	},
	shootRandomly: function() {
		var maxBullets = 5;
		if (Crafty("Bullet").length < maxBullets && Game.chance(0.5)) this.shoot();
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
		if (this.has("Grabbed")) return;
		if (this.has("Stunned")) return;
		if (this.has("Disarmed")) return;
		this.sword = Crafty.e('Sword').wieldedBy(this); //keep track of it to change its direction
		this.swordOut = true;
	},
	changeDirectionOfSword: function(newDirection) {
		this.swordRotation = newDirection;
	},
});

Crafty.c('SwingSwordRandomly', {
	init: function() {
		this.requires('CanSwingASword');
		this.bind('EnterFrame', function() {
			if (Game.chance(1)) {
				this.swingSword();
			}
		});
	},
});

//If the player touches it, some health is lost
//Currently does nothing to anything else
Crafty.c('HurtsToTouch', {
	painfulness: 1, //how much this hurts
	init: function() {
		this.requires('Actor, Collision');
		this.onHit('Hero', this.touch);
	},
	
	touch: function(data) {
		if (this.has("Grabbed")) return;
		target = data[0].obj; //the target in this case should always be Hero.
		target.setHealthBar(target.health-this.painfulness);
		if (this.has('PoisonTouch')) target.requires('Poisoned');
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

Crafty.c('StopsAtWalls', {//So you ran into a wall.
	//Maybe all is not lost?
	//Here we cancel out only that part of the movement that actually keeps us touching solids
	//Somewhat slow, currently
	
	init: function() {
		this.requires('Collision');
		this.onHit('Solid', this.stopMovement);
	},
	stopMovement: function() {
		if (this.has('Grabbed')) return;
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
		this.requires('MovesAround, HurtsToTouch, StopsAtWalls');
		this.bind('EnterFrame', this.swarm);
	},
	swarm: function() {
		this.chase(Crafty('Hero'));
	},
});


Crafty.c('Fleeing', {
	init: function() {
		this.requires('MovesAround, HurtsToTouch, StopsAtWalls');
		this.bind('EnterFrame', this.flee);
	},
	flee: function() {
		this.chase(Crafty('Hero'));
		this.turnAround();
	},
});

//anything that takes damage HasHealth.
Crafty.c('HasHealth', {	
	health: 1, //tracks how much health you have
	invulnerable: false, //while invulnerable, take no damage
	init: function() {
		this.requires('Delay');
	},
	
	setHealth: function(newHealth){
		if(newHealth < 0) newHealth = 0; //can't have negative health
		if(newHealth == this.health) return;
		else if(newHealth < this.health){ //if it's pain
			if(!this.invulnerable){
				this.health = newHealth;
				this.invulnerable = true;			//Trigger invulnerability so we just get hurt once
				this.alpha = 0.4;					//Trigger a visual representation of invulnerability
				//Wait a second, then go back to normal
				this.delay(function() { this.invulnerable = false; this.alpha = 1; }, 500);
				}
			}
		else{ //if it's healing
			if(this.has('HasHealthBar') && newHealth > this.maxHealth) newHealth = this.maxHealth; 
			this.health = newHealth;
		}
		if(this.health <= 0) this.die();
	},
	
	die: function() {
		if (this.has('Hero')) {
			Crafty.trigger('HeroDied', this);
			return;
		}
		this.destroy();
	},
	
	loseHealth: function(pain) {
		var newHealth = this.health - pain;
		if (this.has('HasHealthBar')) this.setHealthBar(newHealth);
		else this.setHealth(this.health - pain);
	},
	
	gainHealth: function(healing) {
		var newHealth = this.health + healing;
		if (this.has('HasHealthBar')) this.setHealthBar(newHealth);
		else this.setHealth(this.health - pain);
	},
});

//This is for the Hero's health bar.
Crafty.c('HasHealthBar', {
	maxHealth: 8, //in *half* hearts
	healthBar: [],			//Holds the Heart components that show up atop the screen
	init: function() {
		this.requires('HasHealth');
		this.setHealth(this.maxHealth);
		//Put a health bar onscreen
		var xOfFirstHeart = Game.map_grid.width / 2 - this.maxHealth / 4;
		this.updateHealthBar();
	},
	
	//keeps the healthbar display up to date.
	updateHealthBar: function(){
		var oldHealth = Crafty('FullHeart').length * 2 + Crafty('HalfHeart').length;
		if(oldHealth == this.health) return;
		this.forceUpdateHealthBar();
	},
	forceUpdateHealthBar: function() {
		Crafty('Heart').destroy(); //destroy the old display
		this.healthbar = []
		var numFullHearts = ~~(this.health/2);
		var halfHearted = this.health % 2;
		var xOfFirstHeart = Game.map_grid.width / 2 - this.maxHealth / 4;
		for (var i = 0; i < this.maxHealth/2; i++) {
			if(i < numFullHearts) this.healthBar[i] = (Crafty.e('FullHeart').at(xOfFirstHeart + i, 1)); //create full hearts,
			else if(halfHearted){ //then perhaps a halfHeart,
				this.healthBar[i] = (Crafty.e('HalfHeart').at(xOfFirstHeart + i, 1));
				halfHearted = false;
				}
			else if(i < this.maxHealth) this.healthBar[i] = (Crafty.e('BrokenHeart').at(xOfFirstHeart + i, 1)); //then the remaining empty Hearts
		}
		if (this.has('Poisoned')) this.turnHeartsGreen();
		if (this.has('Regenerating')) this.turnHeartsBlue();
	},
	
	//setHealth for our Hero and display.
	setHealthBar: function(newHealth){
		this.setHealth(newHealth);
		this.updateHealthBar();
	},
	
	//this is for when the Hero touches something that hurts.
	getHurt: function(data){ 
		sourceOfPain = data[0].obj;
		data[0].obj = this;
		sourceOfPain.touch(data);
	}
});

//This component randomly spawns new enemies
Crafty.c('SpawnPoint', {
	probability: 0.2,
	init: function() {
		this.requires('Terrain');
		this.bind('EnterFrame', this.thinkAboutSpawning);
	},
	thinkAboutSpawning: function() {
		var maxCollectibles = 10;
		var chanceOfSentinel = 33;
		if (Crafty('Enemy').length + Crafty('SpawningVillage').length < maxCollectibles && Game.chance(this.probability)) {
			if (Game.chance(chanceOfSentinel)) {
				var newGuy = Crafty.e('Sentinel').at(this.tileX, this.tileY + 1);
			}
			else if (Game.chance(50)) {
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

//A Terrain is a static object made to be placed and kept in a room.
Crafty.c('Terrain', {
	init: function() {
		this.requires('Actor, StaysInRoom');
	},
	placeInRoom: function(room) {
		this.room = room;
	}
});

//Stepping on a spike trap will cause you to be hurt.
Crafty.c('SpikeTrap', {
	init: function() {
		this.requires('Actor, Collision, spr_spikeTrap, Trap, Terrain');
		this.painfulness = 1;
		this.onHit('Solid', this.spring);
	},
	spring: function() {
		this.removeComponent('spr_spikeTrap');
		this.requires('HurtsToTouch, HurtsMonsters, spr_spikes, PoisonTouch');
		//Would like to make them Solid, but can't find a good way to do that without either
		//A) keeping them from ever springing
		//or B) making the hero pass through walls as soon as he springs a trap
	},
});

//Heart deals with anything that lives in the health bar.
Crafty.c('Heart', {
	init: function() {
		this.requires('Actor, Collision');
		this.z = 100;
		this.onHit('Actor', function() {
			this.alpha = 0.4;
		},
		function() {
			this.alpha = 1;
		});
	}
});

//StaysInRoom is a label that prevents objects from moving between rooms along with the player.
//Uncommenting this makes things really weird!
//Crafty.c('StaysInRoom', {
//	init: function() {}
//});

//A Collectable is anything that must be destroyed to clear a room. 
Crafty.c('Collectable', {
	init: function() {
		this.requires('Actor, HasHealth');
	},
	collect: function() {
		//Crafty.audio.play('knock');
		if (this.has('Enemy')) {
			if (Game.chance(10)) this.dropPotion();
		}
		Crafty.trigger('Collected', this);
		this.destroy();
		if (this.has('Terrain')) {
			this.eraseFromRoom();
		}
	},
	eraseFromRoom: function() {
		this.room.contents[this.at().x][this.at().y] = false;
	},
	dropPotion: function() {
		if (Game.chance(33)) {
			Crafty.e('Antidote').at(this.at().x, this.at().y);
		}
		else if (Game.chance(50)) {
			Crafty.e('HealingPotion').at(this.at().x, this.at().y);
		}
		else {
			Crafty.e('RegenPotion').at(this.at().x, this.at().y);
		}
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
			this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height, tileX: x, tileY: y });
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
