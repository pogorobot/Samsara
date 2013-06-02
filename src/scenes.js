//Currently there are four scenes:
//	The initial loading screen
//	The main game screen, with the villagers and the slaughter thereof
//	A victory screen, once all the enemies are dead
//	A defeat screen, once you yourself the player are dead


//Loading Scene
// -------------
// Handles the loading of binary assets such as images and audio files
Crafty.scene('Loading', function() {
	// Draw some text for the player to see in case the file takes
	// A noticeable amount of time to load
	var loadingText = Crafty.e('2D, DOM, Text')
		.text('Loading...')
		.attr({ x: 0, y: Game.height() / 2 - 24, w: Game.width() })
		.css($text_css);
	
	Crafty.load([
		'assets/16x16_forest_2.gif', 		//Sprites that came with the tutorial
		'assets/burningHouse.gif',			//Modified village sprite CHANGE would be nice to animate...
		'assets/hunter.png',				//Current player (and enemy) spritesheet
		'assets/swordSwing.gif',			//Ha ha whoops I drew a bunch of sprites but forgot to preload them
		'assets/8x8_bullet.gif',
		'assets/16x16_hearts.gif',			//There, fixed.
		'assets/skeleton.png',
		'assets/door_knock_3x.mp3',			//I'm not sure why all the audio files are in three formats??
		'assets/door_knock_3x.ogg',			//That's how they did it in the tutorial =/
		'assets/door_knock_3x.aac',			//Seems kind of silly tbh
		'assets/board_room_applause.mp3',	//Played on victory
		'assets/board_room_applause.ogg',
		'assets/board_room_applause.aac',
		'assets/candy_dish_lid.mp3',		//Played on beginning of the game
		'assets/candy_dish_lid.ogg',
		'assets/candy_dish_lid.aac'
		], function() {
		//Once the image is loaded...
		
		// Define the individual sprites in the image
		// Each one becomes a component
		// These components' names are prefixed with "spr_"
		// to remind us that they simply cause the entity to be drawn
		// with a particular sprite.
		
		//Crafty.sprite(16, 'assets/16x16_forest_2.gif', { 
		Crafty.sprite(16, 'assets/burningHouse.gif', { //Same as forest_2 but with the house on fire
			spr_tree:    [0, 0],
			//spr_bush:    [1, 0],
			spr_village: [0, 1],
			spr_rock:    [1, 1]
		});
		Crafty.sprite(16, 'assets/IceRockMap.gif', {spr_bush: [1, 0]});
		Crafty.sprite(16, 'assets/swordSwing.gif', { spr_sword: [3, 0] }); //Static sword, not currently in use //I lied
		//Geez, so don't remove this, because if it can't find a sprite asset Crafty's error message is STUPID.
		//If you see an error on line 7009, it is probably due to a sprite not existing, FYI.
		Crafty.sprite(16, 'assets/16x16_hearts.gif', {
			spr_heart:      [0, 0],
			spr_emptyHeart: [1, 0],
			spr_halfHeart:  [2, 0]
		});
		Crafty.sprite(8, 'assets/8x8_bullet.gif', {
			spr_bullet: [0, 0]
		});
		
		// Define the PC's sprite to be the first sprite in the third row of the 
		// animation sprite map
		Crafty.sprite(16, 'assets/skeleton.png', {
			spr_player: [0, 2],
		}, 0, 2);
		
		Crafty.sprite(16, 'assets/hunter.png', {
			spr_villager: [0, 2],
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
		//All ready to start the game!
		//Replace the loading screen text with something more...
		//...colorful.
		loadingText.text('Press any key to start murdering innocents!');
		//Not, y'know, literally.
	}),
	this.begin = this.bind('KeyDown', function() { //As soon as we're loaded, you can hit a key to start
		Crafty.scene('Game');
	});
}, function() {
	this.unbind('KeyDown', this.begin);
});

//Main Game Scene
// -------------
// The main, basic game loop
// A TON of the logic is done by individual components
// So really this is just placing everything on the map and keeping rough track of it.
// Also has event listeners to check if we've won or lost (and therefore need to change scenes)
Crafty.scene('Game', function() {
	
	this.occupied = new Array(Game.map_grid.width);
	// A 2D array to keep track of all occupied tiles
	// And by 'occupied' I mean you don't want to spawn another thing there.
	for (var i = 0; i < Game.map_grid.width; i++) {
		this.occupied[i] = new Array(Game.map_grid.height);
		for (var y = 0; y < Game.map_grid.height; y++) {
			this.occupied[i][y] = false;
		}
	}
	
	//Spawn the player first, somewhere not stuck in a wall.
	this.player = Crafty.e('Hero').at(Crafty.math.randomInt(1, Game.map_grid.width - 2), Crafty.math.randomInt(1, Game.map_grid.height - 2));
	//Don't spawn anything on top of 'em.
	this.occupied[this.player.at().x][this.player.at().y] = true;
	
	// Place a tree at every edge square on our grid of 16x16 tiles
	var max_enemies = 0;
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
			} else if (Math.random() < 0.03 && !this.occupied[x][y] && Crafty('Enemy').length < max_enemies) {
				Crafty.e('Enemy').at(x, y);
				this.occupied[x][y] = true;
			}
		}
	}
	
	// Generate a lucky number of villages on the map in random locations
	// Or, to be precise, give every location a small chance of spawning a village (until you run out)
	var max_villages = 10;
	for (var x = 0; x < Game.map_grid.width; x++) {
		for (var y = 0; y < Game.map_grid.height; y++) {
			if (Math.random() < 0.02) {
				//Spawn one as long as you haven't hit the max, the square isn't occupied, and the square it would spawn enemies at isn't occupied
				if (Crafty('Village').length < max_villages && !this.occupied[x][y] && !this.occupied[x][y+1]) {
					Crafty.e('Village').at(x, y);
				}
			}
		}
	}
	
	Crafty.audio.play('ring'); //Little chime to signal kickoff
	
	//Every time we might have won, check if we've won
	this.show_victory = this.bind('VillageVisited', function() {
		if (!Crafty('Collectible').length) {
			Crafty.scene('Victory');
		}
	});
	
	//Every time we get hurt, check if we're dead
	this.show_defeat = this.bind('LostHeart', function() {
		if (!Crafty('Heart').length && !Crafty('HalfHeart').length) {
			Crafty.scene('Defeat');
		}
	});
}, function() { //Don't leave these listeners constantly waiting around for an event, for hygiene's sake
	this.unbind('LostHeart', this.show_defeat);
}, function() {
	this.unbind('VillageVisited', this.show_victory);
});

//Victory Scene
// -------------
// When you are all alone in the world
// You win
// Basically just says so, then lets you restart if you wanna
Crafty.scene('Victory', function() {
	//Plop some text on the screen, bein' all, YOU WON!!
	var youWonText = Crafty.e('2D, DOM, Text')
		.attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
		.text('Harvest Complete!')
		.css($text_css);
	
	Crafty.audio.play('applause');
	
	//Wait before just letting you restart
	var delay = true;
	setTimeout(function() { 
		delay = false; 
		youWonText.text("Care to go another round?");
	}, 2000);
	
	//Once the delay is up, restart on the press of any key
	this.restart_game = this.bind('KeyDown', function() {
		if (!delay) {
			Crafty.scene('Game');
		}
	});
}, function() {
	this.unbind('KeyDown', this.restart_game);
});


//Defeat scene
//------------
//This is what happens when you die
//It is basically the same as what happens when you win?
//There's something poignant in that.
Crafty.scene('Defeat', function() {
	var youLostText = Crafty.e('2D, DOM, Text')
		.attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
		.text("Oh... That didn't go so well.")
		.css($text_css);
	
	Crafty.audio.play('knock');
	
	var delay = true;
	setTimeout(function() { 
		delay = false; 
		youLostText.text("Care to try again?");
	}, 2000);
		
	this.restart_game = this.bind('KeyDown', function() {
		if (!delay) {
			Crafty.scene('Game');
		}
	});
}, function() {
	this.unbind('KeyDown', this.restart_game);
});
