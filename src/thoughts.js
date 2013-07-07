//An interior monologue, composed of many bite-sized thoughtstrings
Crafty.c('TrainOfThought', {
	bookmark: 0,
	init: function() {
		this.thoughts = new Array();
	},
	think: function() {
		if (this.bookmark >= this.thoughts.length) {
			this.bookmark = 0;
		}
		Game.think(this.thoughts[this.bookmark]);
		this.bookmark++;
	},
	keepThinking: function() {
		this.think();
		this.timeout(this.keepThinking, 3500);
	},
	//takes one string
	loadThought: function(newThought) {
		this.thoughts.push(newThought);
		return this;
	},
	//takes an array of strings
	loadThoughts: function(newThoughts) {
		for (var i = 0; i < newThoughts.length; i++) {
			this.thoughts.push(newThoughts[i]);
		}
		return this;
	},
});
