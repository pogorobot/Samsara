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