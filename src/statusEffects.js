//Status effects are components that represent some condition placed on the target

//Grabbed targets are immobilized and cannot fight.
Crafty.c('Grabbed', {
	init: function() {
		this.requires('Alive');
		if (this.has('ShootsAtPlayer'))	this.interruptShooting();
	},
	keepRotationZero: function() {
		this.rotation = 0;
	},
});

//Poisoned targets 
Crafty.c('Poisoned', {
	poisonStrength: 1,
	poisonTime: 5000, //time between ticks (in ms)
	init: function() {
		this.requires('HasHealth, Delay');
		this.delay(this.sufferFromPoison, this.poisonTime);
		if (this.has('HasHealthBar')) {
			this.turnHeartsGreen();
		}
	},
	sufferFromPoison: function() {
		if (!this.has('Poisoned')) return;
		this.loseHealth(this.poisonStrength);
		this.delay(this.sufferFromPoison, this.poisonTime);
	},
	turnHeartsGreen: function() {
		for (var i = 0; i < this.healthBar.length; i++) {
			if (this.healthBar[i].has('FullHeart')) {
				this.healthBar[i].requires('spr_poisonedHeart');
			}
			else if (this.healthBar[i].has('HalfHeart')) {
				this.healthBar[i].requires('spr_poisonedHalfHeart');
			}
		}
	},
	curePoison: function() {
		this.removeComponent('Poisoned');
		if (this.has('HasHealthBar')) this.forceUpdateHealthBar();
	},
});

Crafty.c('Stunned', {
	stunnedTime: 500,
	init: function() {
		this.requires("Delay");
		if (this.has('ShootsAtPlayer'))	this.interruptShooting();
		this.delay(function() {
			this.removeComponent("Stunned");
		}, this.stunnedTime);
	},
});

Crafty.c('Slowed', {
	slowedTime: 4500,
	init: function() {
		if (this.has('Fourway')) {
			this.originalSpeed = this.movementSpeed;
			this.movementSpeed /= 2;
			this.fourway(this.movementSpeed);
		}
		this.awaitUnslowing();
	},
	awaitUnslowing: function(slowedTime) {
		if (slowedTime === undefined) slowedTime = this.slowedTime;
		this.delay(function() {
			this.trigger("SlowTimeRanOut");
		}, slowedTime);
		this.bind("SlowTimeRanOut", this.unSlow);
	},
	unSlow: function() {
		if (this.has('Fourway')) {
			this.movementSpeed = this.originalSpeed;
			this.fourway(this.movementSpeed);
		}
		this.removeComponent('Slowed');
	},
	addSlowTime: function() {
		this.unbind("SlowTimeRanOut");
		this.bind("SlowTimeRanOut", this.awaitUnslowing);
	},
});

Crafty.c('CausesSlowed', {
	init: function() {
		this.bind('HurtSomething', function(data) {
			if (data.has('Slowed')) {
				data.addSlowTime();
			}
			else data.requires('Slowed');
		});
	},
});

Crafty.c('PoisonTouch', {
	init: function() {
		this.bind("HurtSomething", function(victim) {
			victim.requires("Poisoned");
		});
	},
});

Crafty.c('Regenerating', {
	regenStrength: 1,
	regenTime: 7000,
	init: function() {
		this.delay(this.regenerate, this.regenTime);
		if (this.has('HasHealthBar')) {
			this.turnHeartsBlue();
		}
	},
	regenerate: function() {
		if (this.health == this.maxHealth) {
			this.removeComponent("Regenerating");
			return;
		}
		this.gainHealth(this.regenStrength);
		this.delay(this.regenerate, this.regenTime);
	},
	turnHeartsBlue: function() {
		for (var i = 0; i < this.healthBar.length; i++) {
			if (this.healthBar[i].has('BrokenHeart')) {
				this.healthBar[i].requires('spr_regenEmptyHeart');
			}
			else if (this.healthBar[i].has('HalfHeart')) {
				if (this.healthBar[i].has('spr_poisonedHalfHeart')) {
					this.healthBar[i].requires('spr_regenPoisonedHalfHeart');
				}
				else {
					this.healthBar[i].requires('spr_regenHalfHeart');
				}
			}
		}
	},
});

Crafty.c('Potion', {
	init: function() {
		//defaults to green. sprite added to make sure hit box was right size.
		this.requires('Actor, spr_antidote, Collision, StaysInRoom');
	}
});

Crafty.c('Antidote', {
	init: function() {
		this.requires('Potion, spr_antidote');
		this.onHit('Hero', function(data) {
			var drinker = data[0].obj;
			if (drinker.has('Poisoned')) {
				drinker.curePoison();
			}
			this.destroy();
		});
		return this;
	},
});


Crafty.c('HealingPotion', {
	potency: 2,
	init: function() {
		this.requires('Potion, spr_healthPotion');
		this.onHit('Hero', function(data) {
			var drinker = data[0].obj;
			drinker.gainHealth(this.potency);
			this.destroy();
		});
		return this;
	},
});

Crafty.c('RegenPotion', {
	init: function() {
		this.requires('Potion, spr_regenPotion');
		this.onHit('Hero', function(data) {
			var drinker = data[0].obj;
			drinker.requires('Regenerating');
			this.destroy();
		});
		return this;
	},
});