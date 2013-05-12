Crafty.scene('Game', function() {
	
	// A 2D array to keep track of all occupied tiles
	this.occupied = new Array(Game.map_grid.width);
	for (var i = 0; i < Game.map_grid.width; i++) {
		this.occupied[i] = new Array(Game.map_grid.height);
		for (var y = 0; y < Game.map_grid.height; y++) {
			this.occupied[i][y] = false;
		}
	}
	this.player = Crafty.e('Hero').at(5, 5);
	this.occupied[this.player.at().x][this.player.at().y] = true;
	
	// Place a tree at every edge square on our grid of 16x16 tiles
	for (var x = 0; x < Game.map_grid.width; x++) {
		for (var y = 0; y < Game.map_grid.height; y++) {
			var at_edge = x == 0 || x == Game.map_grid.width - 1 || y == 0 || y == Game.map_grid.height - 1;
			
			if (at_edge) {
				// Place a tree entity at the current tile
				Crafty.e('Tree').at(x, y);
				this.occupied[x][y] = true;
			} else if (Math.random() < 0.06 && !this.occupied[x][y]) {
				// Place a bush entity at the current tile
				var bush_or_rock = (Math.random() > 0.3) ? 'Bush' : 'Rock';
				Crafty.e(bush_or_rock).at(x, y);
				this.occupied[x][y] = true;
			} else if (Math.random() < 0.03 && !this.occupied[x][y]) {
				Crafty.e('Enemy').at(x, y);
				this.occupied[x][y] = true;
			}
		}
	}
	
	// Generate up to five villages on the map in random locations
	var max_villages = 5;
	for (var x = 0; x < Game.map_grid.width; x++) {
		for (var y = 0; y < Game.map_grid.height; y++) {
			if (Math.random() < 0.02) {
				if (Crafty('Village').length < max_villages && !this.occupied[x][y]) {
					Crafty.e('Village').at(x, y);
				}
			}
		}
	}
	
	Crafty.audio.play('ring');
	
	this.show_victory = this.bind('VillageVisited', function() {
		if (!Crafty('Village').length && !Crafty('Enemy').length) {
			Crafty.scene('Victory');
		}
	});
}, function() {
	this.unbind('VillageVisited', this.show_victory);
});

Crafty.scene('Victory', function() {
	Crafty.e('2D, DOM, Text')
		.attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
		.text('Harvest Complete!')
		.css($text_css);
	
	Crafty.audio.play('applause');
	
	var delay = true;
	setTimeout(function() { delay = false; }, 5000);
		
	this.restart_game = this.bind('KeyDown', function() {
		if (!delay) {
			Crafty.scene('Game');
		}
	});
}, function() {
	this.unbind('KeyDown', this.restart_game);
});

//Loading Scene
// -------------
// Handles the loading of binary assets such as images and audio files
Crafty.scene('Loading', function() {
	// Draw some text for the player to see in case the file takes
	// A noticeable amount of time to load
	Crafty.e('2D, DOM, Text')
		.text('Loading...')
		.attr({ x: 0, y: Game.height() / 2 - 24, w: Game.width() })
		.css($text_css);
	
	Crafty.load([
		'assets/16x16_forest_2.gif', 
		'assets/hunter.png',
		'assets/door_knock_3x.mp3',
		'assets/door_knock_3x.ogg',
		'assets/door_knock_3x.aac',
		'assets/board_room_applause.mp3',
		'assets/board_room_applause.ogg',
		'assets/board_room_applause.aac',
		'assets/candy_dish_lid.mp3',
		'assets/candy_dish_lid.ogg',
		'assets/candy_dish_lid.aac'
		], function() {
		//Once the image is loaded...
		
		// Define the individual sprites in the image
		// Each one becomes a component
		// These components' names are prefixed with "spr_"
		// to remind us that they simply cause the entity to be drawn
		// with a particular sprite.
		
		Crafty.sprite(16, 'assets/16x16_forest_2.gif', {
			spr_tree:    [0, 0],
			spr_bush:    [1, 0],
			spr_village: [0, 1],
			spr_rock:    [1, 1]
		});
		
		// Define the PC's sprite to be the first sprite in the third row of the 
		// animation sprite map
		Crafty.sprite(16, 'assets/hunter.png', {
			spr_player: [0, 2],
		}, 0, 2);
		
		// Define our sounds for later use
		Crafty.audio.add({
			knock: ['assets/door_knock_3x.mp3',
				'assets/door_knock_3x.ogg',
				'assets/door_knock_ex.aac'],
			applause: ['assets/board_room_applause.mp3',
				'assets/board_room_applause.ogg',
				'assets/board_room_applause.aac'],
			ring:   ['assets/candy_dish_lid.mp3',
				'assets/candy_dish_lid.ogg',
				'assets/candy_dish_lid.aac']
		});
		
	}),
	this.begin = this.bind('KeyDown', function() {
		Crafty.scene('Game');
	});
}, function() {
	this.unbind('KeyDown', this.begin);
});