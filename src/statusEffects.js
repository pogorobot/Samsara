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
	},
	sufferFromPoison: function() {
		this.loseHealth(this.poisonStrength);
		this.delay(this.sufferFromPoison, this.poisonTime);
	},
});