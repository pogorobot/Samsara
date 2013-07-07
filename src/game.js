//Game.js defines the Game object, which is in charge of:
//	Initializing the grid of tiles
//	Setting the background color
//	Defining the height and width of the game window

Game = {

	// This defines our grid's size and the size of each of its tiles
	map_grid: {
		width:   28,
		height:  21,
		//to access this: e.g. Game.map_grid.tile.width
		tile: {
			width:  16,
			height: 16
		}
	},
	
	//Here is where we define the height and width of the game window (as opposed to the grid)
	//Right now the grid takes up the whole screen. That could change in the future!
	width: function() {
		return this.map_grid.width * this.map_grid.tile.width;
	},
	height: function() {
		return this.map_grid.height * this.map_grid.tile.height;
	},
	
	think: function(thought) {
		$(document).ready(function() {
			previousThought = $('.thoughts-2').html();
			$('.thoughts-2').html("<p>" + thought + "</p>");
			$('.thoughts').html(previousThought);
		});
	},
	
	chance: function(percent) {
		return Math.random() * 100 < percent;
	},
	
	// Initialize and start our game
	start: function() {
		//Initialize Crafty, creating a canvas window
		Crafty.init(Game.width(), Game.height()); 
		//Set the background color - let's go with a nice frosty blue
		Crafty.background('rgb(87, 109, 124)');
		//Begin with the Loading scene - see 'scenes.js'
		Crafty.scene('Loading');
	},
	
	loadThoughts: function() {
		Crafty.e('TrainOfThought').loadThoughts([
			"I shouldn't be here.",
			"He wouldn't want me to be here.",
			"I don't have a choice.",
			"I don't care.",
			"This is pointless anyway.",
			"He's not here.",
			"He's dead, or  worse.",
			"And what if he's not?",
			"What if he's here, and I leave?",
			"You want to risk it?",
			"He doesn't need me anyway.",
			"Bullshit!",
			"He doesn't need me, he doesn't want me.",
			"I shouldn't be here.",
			"I don't get to be the hero. That's not me.",
			"...",
			"What if he's dead?",
			"What happened in there?",
			"Last I heard it was a great victory.",
			"Peace and freedom forever.",
			"Sound the trumpets, all hail Sir Theodore.",
			"Does he remember me?",
			"It doesn't matter.",
			"But does he, though?",
			"That's not why we're here.",
			"We shouldn't be here.",
			"That's right."
		]).keepThinking();
	},
}

$text_css = { 'font-size': '24px', 
	'font-family': 'Arial', 
	'color': 'white', 
	'text-align': 'center' 
}
