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
	//Call Game.chance() for an intuitive percent-chance function.
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
		Game.trainOfThought = Crafty.e('TrainOfThought').loadThoughts(MauriceTestMonologue).trigger("ThinkAgain");
	},
	
	contemplate: function(thoughtStream) {
		Game.trainOfThought = Crafty.e('TrainOfThought').loadThoughts(thoughtStream).trigger("ThinkAgain");
	},
	
	interruptThoughts: function(thoughtStream) {
		Game.trainOfThought.stopThinking();
		Game.previousTrainOfThought = Game.trainOfThought;
		Game.contemplate(thoughtStream);
	},
	
	resumeThinking: function(previousTrainOfThought) {
		Game.trainOfThought = previousTrainOfThought;
		Game.previousTrainOfThought = undefined;
		Game.trainOfThought.resumeThinking();
		Game.think("Anyway...");
	},
	
	unloadThoughts: function() {
		Game.trainOfThought.stopThinking();
	},
}

$text_css = { 'font-size': '24px', 
	'font-family': 'Arial', 
	'color': 'white', 
	'text-align': 'center' 
}
