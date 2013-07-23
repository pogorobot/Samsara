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
		.attr({ x: 0, y: Game.height() / 2 - 72, w: Game.width() })
		.css($text_css);
	
	Crafty.load([
		'assets/16x16_forest_2.gif', 		//Sprites that came with the tutorial
		'assets/burningHouse.gif',			//Modified village sprite CHANGE would be nice to animate...
		'assets/hunter.png',				//Current player (and enemy) spritesheet
		'assets/swordSwing.gif',			//Ha ha whoops I drew a bunch of sprites but forgot to preload them
		'assets/8x8_bullet.gif',
		'assets/16x16_hearts.gif',			//There, fixed.
		'assets/zigguratWalls.png',
		'assets/skeleton.png',
		'assets/sentinel.png',
		'assets/spikes.png',
		'assets/arrow.png',
		'assets/deathGrip.png',
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
			spr_bullet: [0, 0],
			spr_deflectedBullet: [1, 0]
		});
		Crafty.sprite(16, 'assets/spikes.png', {
			spr_spikeTrap:   [0, 0],
			spr_spikes:		 [1, 0]
		});
		Crafty.sprite(16, 'assets/arrow.png', {
			spr_arrow: [0, 0]
		});
		Crafty.sprite(9, 'assets/deathGrip.png', {
			spr_deathGrip: [0, 0]
		});
		Crafty.sprite(16, 'assets/sentinel.png', {
			spr_sentinel_down: [0, 0],
			spr_sentinel_up: [1, 0],
			spr_sentinel_right: [2, 0],
			spr_sentinel_left: [3, 0]
		});
		
		// Define the PC's sprite to be the first sprite in the third row of the 
		// animation sprite map
		Crafty.sprite(16, 'assets/skeleton.png', {
			spr_player: [0, 2],
		}, 0, 2);
		
		Crafty.sprite(16, 'assets/hunter.png', {
			spr_villager: [0, 2],
		}, 0, 2);
		
		Crafty.sprite(16, 'assets/zigguratWalls.png', {
			spr_wall:  [1, 0],
			spr_block: [0, 0],
			spr_door:  [2, 0],
			spr_floor: [3, 0]
		});
		
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
		loadingText.text('To Play:<br>WASD: Controls movement<br>Space: Swings your sword<br>P: Pause<br>C: Place Mysterious Arrows');
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
	/*
	//This makes the floor look nice, but lags everything to hell.
	for (var x = 0; x < Game.map_grid.width; x++) {
		for (var y = 0; y < Game.map_grid.height; y++) {
			Crafty.e('Floor').at(x, y);
		}
	}
	*/
	
	//Spawn the player first, somewhere not stuck in a wall.

	//Don't spawn anything on top of 'em.
	//this.occupied[this.player.at().x][this.player.at().y] = true;
	//Crafty.e('Room').leaveEmpty(this.player.at().x, this.player.at().y).populate().display();
	this.megaMap = Crafty.e('StaticMegaMap');
	this.megaMap.placeHero();
	//this.coordinates = this.megaMap.placeHero();
	//this.megaMap.placeHero();
	
	
	//Uncomment this and the camera tracks the player!
	//Probably it should do that for outdoor scenes, but stay room-to-room for indoor ones??
	//this.camera = Crafty.e('Camera').camera(Game.player);
	

	Crafty.audio.play('ring'); //Little chime to signal kickoff
	
	Game.loadThoughts();
	
	//Every time we might have won, check if we've won
	this.show_victory = this.bind('Collected', function() {
		if (!Crafty('Collectable').length) {
			Crafty.trigger('DoorsOpen');
		}
	});
	/*
	this.changeRooms = this.bind('LeftScreen', function(data) {
		Crafty('Terrain').destroy();
		var room = Crafty.e('Room').leaveEmpty(this.player.at().x, this.player.at().y).populate().display();
	});
	*/
	this.wentUp = this.bind('WentUp', function() {
		Crafty('StaysInRoom').destroy();
		this.megaMap.roomY--;
		this.megaMap.placeHero(this.megaMap.roomX, this.megaMap.roomY);
	});
	this.wentDown = this.bind('WentDown', function() {
		Crafty('StaysInRoom').destroy();
		this.megaMap.roomY++;
		this.megaMap.placeHero(this.megaMap.roomX, this.megaMap.roomY);
	});
	this.wentRight = this.bind('WentRight', function() {
		Crafty('StaysInRoom').destroy();
		this.megaMap.roomX++;
		this.megaMap.placeHero(this.megaMap.roomX, this.megaMap.roomY);
	});
	this.wentLeft = this.bind('WentLeft', function() {
		Crafty('StaysInRoom').destroy();
		this.megaMap.roomX--;
		this.megaMap.placeHero(this.megaMap.roomX, this.megaMap.roomY);
	});
	
	//If we died, change the screen.
	this.show_defeat = this.bind('HeroDied', function() {Crafty.scene('Defeat');});
}, function() { //Don't leave these listeners constantly waiting around for an event, for hygiene's sake
	this.unbind('HeroDied', this.show_defeat);
}, function() {
	this.unbind('Collected', this.show_victory);
}, function() {
	this.unbind('WentUp', this.WentUp);
}, function() {
	this.unbind('WentDown', this.WentDown);
}, function() {
	this.unbind('WentLeft', this.WentLeft);
}, function() {
	this.unbind('WentRight', this.WentRight);
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
