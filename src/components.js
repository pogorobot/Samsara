
//Hero Component
//--------------
//Here you have it: The player's avatar
Crafty.c('Hero', {
	animation_duration: 4, //in frames
	movementSpeed: 2, //in pixels per frame
	init: function() {
		//Requirements:   Actor (exists on a grid), Solid (enemies don't walk through  you), 
						//Fourway, Collision, Keyboard (various interface functionality), 
						//spr_player, SpriteAnimation (for your appearance)
		this.requires('Actor, Alive, Solid, Fourway, Collision, HasHealthBar, SwingSwordOnSpace, spr_player, SpriteAnimation, Keyboard, CanEatSoulOrbs, ThrowsOrbs')
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
		//NewDirection is an event triggered by the Fourway component
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
		this.bind('EnterFrame', this.changeRoomsIfOutside);
	},
	
	//Called every frame
	//Checks to see if our valiant hero has strayed beyond the boundaries of the screen
	//And triggers an event if so, which the scene catches.
	changeRoomsIfOutside: function() {
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
	},
	
	//Bind doors closing to Hero's movement
	//Called by the map when it instantiates a new room
	doorsWillClose: function() {
		this.unbind('Moved', this.triggerDoors); //Don't want to bind stuff twice!
		this.bind('Moved', this.triggerDoors);
	},
	
	//Check if we're safely inside the room, then trigger the event that closes the doors
	triggerDoors: function(){
		if (this.insideWallEdge()) {
			Crafty.trigger('DoorsClose');
			this.unbind('Moved', this.triggerDoors);
		}
	},
	
	//Tells us we've successfully entered the room, and can close doors without getting stuck in a wall
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


//Not currently in use.
//Crafty.e("Camera").camera(whatever) will cause the hero to follow whatever.
//Will come in handy whenever we introduce Rooms that are larger than one screen.
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
		this.requires('Actor, Solid, Alive, Collectable, StaysInRoom');
		this.health = 2;
	},
});

//FleeingEnemies are generic cowardly enemies, running away from the Hero while firing bullets.
Crafty.c('FleeingEnemy', {
	init: function() {
		this.requires('Enemy, Fleeing, ShootsAtPlayer, spr_villager, DirectionalAnimation');
		//Tell the DirectionalAnimation component where on the spritesheet to find its animations
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
		//Tell the DirectionalAnimation component where on the spritesheet to find its animations
		this.setDirectionAnimations(
			{x: 0, y: 0}, //up
			{x: 0, y: 2}, //down
			{x: 0, y: 1}, //right
			{x: 0, y: 3}, //left
			2); //two frames each
	},
});

//Used by Hero, exclusively
//Sets a bunch of keybinds
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
				Crafty.e('Arrow').setRotation(this.swordRotation).at(this.at().x, this.at().y);
			}
		});
	},
});

//Used by Hero, exclusively
//Sets the keybind for healing using Soul Orbs
Crafty.c('CanEatSoulOrbs', {
	init: function() {
		this.requires('Keyboard, CarriesOrbs');
		this.bind('KeyDown', function() {
			if (this.isDown('E')) {
				if (this.orbsCarried.length) {
					this.orbsCarried[0].spiralDownward();
					this.orbsCarried.splice(0, 1);
				}
			}
		});
	},
});

//Entity-level component
//Death grip shoots out of the hero, grabs any enemy it finds, and returns them to the hero
Crafty.c('DeathGrip', {
	turned: false,
	//Time spent moving forward, before turning around, in milliseconds
	moveForwardTime: 300,
	//Time any grabbed enemy will stay grabbed, in milliseconds
	grabTime: 2000,
	init: function() {
		this.requires('Actor, spr_deathGrip, Collision, Delay, MovesAround');
		this.speed = 4;
		this.origin(this.w / 2, this.h / 2); //set origin to center
		this.onHit('StopsBullets', this.detachThenDestroy);
		return this;
	},
	//Move in whatever direction the hero is facing
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
		this.delay(this.boomerang, this.moveForwardTime);
	},
	//Return to whence you came
	courseCorrect: function() {
		this.chase(this.master);
	},
	//Pick up an enemy to return it to the hero
	grab: function(enemy) {
		if (enemy.has("Grabbed")) return;
		enemy.requires('Grabbed');
		this.attach(enemy);
		enemy.bind('EnterFrame', enemy.keepRotationZero); //You're attached, but don't rotate your sprite
		enemy.delay(function() {
			enemy.unbind('EnterFrame', enemy.keepRotationZero);
			enemy.removeComponent('Grabbed');
			if (enemy._parent) {
				enemy._parent.detach(enemy);
			}
		}, this.grabTime);
		this.boomerang();
	},
	//Turn around and return to the hero
	boomerang: function() {
		this.bind('EnterFrame', this.courseCorrect);
		this.onHit('Hero', function(data) {
			hero = data[0].obj;
			this.transferTo(hero);
		});
	},
	//Release all children, then self-destruct
	detachThenDestroy: function() {
		this.detach();
		this.destroy();
	},
	//All enemies grabbed by the Death Grip are now grabbed by the hero
	transferTo: function(hero) {
		//I am not sure why these have to be 1s and not 0s!
		//this._children[0] is always set to ..something...not.......right.
		//???
		for (var i = 1; i < this._children.length; i++) {
			hero.attach(this._children[1]);
		}
		this.detachThenDestroy();
	},
});

//Used by Hero exclusively. (for now)
//Allows her to keep track of any Soul Orbs that may be orbiting.
Crafty.c('CarriesOrbs', {
	init: function() {
		this.orbsCarried = [];
	},
	carryOrb: function(orb) {
		this.orbsCarried.push(orb);
	},
	loseOrb: function(orb) {
		for (var i = 0; i < this.orbsCarried.length; i++) {
			if (this.orbsCarried[i] === orb) {
				this.orbsCarried.splice(i, 1);
				return;
			}
		}
	},
});

//Used by Hero exclusively
//If there are any SoulOrbs orbiting, send the first one flying in the direction of a mouse click
Crafty.c('ThrowsOrbs', {
	init: function() {
		this.requires("Actor, CarriesOrbs");
		//Any time we click on the stage, fire this.throwOrb, with the click event attached
		Crafty.addEvent(this, Crafty.stage.elem, "click", this.throwOrb);
	},
	//Translate a mouse click into a shooting Soul Orb
	throwOrb: function(e) {
		pos = Crafty.DOM.translate(e.clientX, e.clientY);
		var target = Crafty.e("2D").attr({ x: pos.x, y: pos.y, w: 3, h: 3});
		if (this.orbsCarried.length) {
			this.orbsCarried[0].headToward(target);
			this.orbsCarried.splice(0, 1);
		}
	},
});

//Entity-level component
//Sentinels are a type of Enemy that marches in a straight line.
//They have four health and hurt more than other enemies when you touch them.
Crafty.c('Sentinel', {
	init: function() {
		this.requires('Enemy, HurtsToTouch, StopsAtWalls, Marching, MovesAround, DirectionalAnimation');
		this.health = 4;
		this.painfulness = 2;
		
		this.setDirectionAnimations("spr_sentinel_up", "spr_sentinel_down", "spr_sentinel_right", "spr_sentinel_left");
		//turn in a random direction
		if (Game.chance(50)) {
			if (Game.chance(50)) {
				this.turn(1, 0);
			}
			else {
				this.turn(-1, 0);
			}
		}
		else {
			if (Game.chance(50)) {
				this.turn(0, 1);
			}
			else {
				this.turn(0, -1);
			}
		}
	},
});

//Currently used by Sword, if wielded by Hero.
//Creates a new Soul Orb when an enemy is killed
Crafty.c('StealsLife', {
	//Called by Sword component, on death of enemy
	stealLife: function() {
		Crafty.e('SoulOrb');
	},
});

//Sword component
//Hero swings a sword on the spacebar; some enemies just swing randomly
//At that point, a new Sword entity is created, attached to whoever swang it.
Crafty.c('Sword', {
	swingTime: 8,
	swingDegrees: 36,
	init: function() {
		this.requires('Actor, spr_sword, Collision, SpriteAnimation, Weapon');
		this.animate('SwordSwinging', 0, 0, 4);
		this.alpha = 0;
	},
	//Play our sword-swing animation
	swing: function() {
		this.alpha = 1;
		this.animate('SwordSwinging', this.swingTime, 0);
	},
	//This function does the b
	wieldedBy: function(wielder) {
		this.wielder = wielder;
		this.attr({ x: wielder.x, y: wielder.y - wielder.h});
		//stick to the wielder
		this.wielder.attach(this);
		//offset our center of rotation to the center of the wielder
		this.origin(wielder.w / 2, wielder.h * 3 / 2);
		//If the wielder is moving left, swing from the left
		this.rotation = wielder.swordRotation;
		this.widenArc(this.swingDegrees);
		//Play the animation
		this.swing();
		//Once it's over, destroy this Sword instance
		this.bind('AnimationEnd', function() {
			this.sheathe();
		});
		//Depending on who's wielding the sword, behave differently
		if (this.wielder.has('Hero')) {
			//The Hero's sword hurts enemies and creates Soul Orbs
			this.requires('HurtsMonsters, DeflectsBullets, StealsLife');
		}
		else {
			//Enemies' swords hurt the Hero.
			this.requires('HurtsToTouch');
		}
		return this;
	},
	//Rotate the sword a bit to make the swing wider
	widenArc: function(degrees) {
		this.rotation += degrees;
		this.bind('EnterFrame', function() {
			this.rotation -= degrees / this.swingTime;
		});
	},
	//Tell the Wielder we're doing it, and then destroy this sword instance
	sheathe: function()
	{
		this.wielder.swordOut = false;
		this.destroy();
	},
});

//Anything that hurts Enemies or destructible terrain has this component
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
		collectable.requires('Stunned');
		//If we destroyed 'em
		if(collectable.health <= 0){
			//And we're a lifestealer
			if(this.has("StealsLife")) {
				//And they were alive to begin with
				if (collectable.has("Alive")) {
					this.stealLife();
				}
			}
		}
		//For Soul Orbs, which destroy themselves once they've hurt an enemy
		this.trigger("HurtSomething");
	},
});

//This is here so the enemies who shoot at you will display a little charging-up animation before shooting
Crafty.c('ChargingBullet', {
	init: function() {
		this.requires('Actor, spr_bullet, SpriteAnimation');
		this.animate('Charging', 2, 0, 6);
		this.animate('Charging', 35, 0);
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

//A Bullet
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
		Crafty('Hero').carryOrb(this);
		this.onHit('Bullet', function(data) {
			var bullet = data[0].obj;
			bullet.destroy();
			Crafty('Hero').loseOrb(this);
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
	interruptShooting: function() {
		for (var i = 1; i < this._children.length; ) {
			if (this._children[i].has("ChargingBullet")) {
				this._children[i].destroy();
				continue;
			}
			i++;
		}
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
		if (this.has('Collectable')) {
			this.collect();
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
	dropPotionChance: 10,
	init: function() {
		this.requires('Actor, HasHealth');
	},
	collect: function() {
		//Crafty.audio.play('knock');
		if (this.has('Enemy')) {
			if (Game.chance(this.dropPotionChance)) this.dropPotion();
		}
		this.destroy();
		Crafty.trigger('Collected', this);
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
