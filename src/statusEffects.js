//Status effects are components that represent some condition placed on the target

//Grabbed targets are immobilized and cannot fight.
Crafty.c('Grabbed', {
	init: function() {
		this.requires('Alive');
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

Crafty.c('Slowed', {
	init: function() {
		if (this.has('Fourway')) {
			this.originalSpeed = this.movementSpeed;
			this.movementSpeed /= 2;
			this.fourway(this.movementSpeed);
		}
		this.delay(this.unSlow, 7000);
	},
	unSlow: function() {
		if (this.has('Fourway')) {
			this.movementSpeed = this.originalSpeed;
			this.fourway(this.movementSpeed);
		}
		this.removeComponent('Slowed');
	},
});

Crafty.c('CausesSlowed', {
	init: function() {
		this.onHit('Alive', function(data) {
			data[0].obj.requires('Slowed');
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
		if (this.health == this.maxHealth) return;
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

Crafty.c('Antidote', {
	init: function() {
		this.requires('Actor, spr_antidote, Collision');
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
		this.requires('Actor, spr_healthPotion, Collision');
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
		this.requires('Actor, spr_regenPotion, Collision');
		this.onHit('Hero', function(data) {
			var drinker = data[0].obj;
			drinker.requires('Regenerating');
			this.destroy();
		});
		return this;
	},
});