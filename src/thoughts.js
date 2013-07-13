//An interior monologue, composed of many bite-sized thoughtstrings
Crafty.c('TrainOfThought', {
	bookmark: 0, //Keeps track of which thought to think next.
	init: function() {
		//An array of strings
		//Might be better as an array of objects, with a string and an interval attached
		this.thoughts = new Array();
	},
	think: function() {
		//If we've thought all the thoughts, start over
		if (this.bookmark >= this.thoughts.length) {
			this.bookmark = 0;
		}
		//Game.think uses jQuery to post the string we're on
		Game.think(this.thoughts[this.bookmark]);
		this.bookmark++;
	},
	keepThinking: function() {
		if (!Crafty.isPaused()) {
			this.think(); //think the next thought, wait a given amount of time, then think again.
		}
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
