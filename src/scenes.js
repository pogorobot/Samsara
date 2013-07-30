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
		.attr({ x: 0, y: Game.height() / 2 - 96, w: Game.width() })
		.textFont({ size: '24px', family: 'Arial', color: 'white', align: 'center' });
	
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
		Crafty.sprite(16, 'assets/statue.png', {
			spr_statue: [0, 0]
		});
		Crafty.sprite(16, 'assets/IceRockMap.gif', {spr_bush: [1, 0]});
		Crafty.sprite(16, 'assets/swordSwing.gif', { spr_sword: [3, 0] }); //Static sword, not currently in use //I lied
		//Geez, so don't remove this, because if it can't find a sprite asset Crafty's error message is STUPID.
		//If you see an error on line 7009, it is probably due to a sprite not existing, FYI.
		Crafty.sprite(16, 'assets/16x16_hearts.gif', {
			spr_heart:      [0, 0],
			spr_emptyHeart: [1, 0],
			spr_halfHeart:  [2, 0],
			spr_poisonedHeart: [3, 0],
			spr_poisonedHalfHeart: [4, 0],
			spr_regenHalfHeart: [5, 0],
			spr_regenPoisonedHalfHeart: [6, 0],
			spr_regenEmptyHeart: [7, 0]
		});
		Crafty.sprite(8, 'assets/8x8_bullet.gif', {
			spr_bullet: [0, 0],
			spr_deflectedBullet: [1, 0],
			spr_soulOrb: [8, 0]
		});
		Crafty.sprite(8, 'assets/potions.png', {
			spr_antidote: [0, 0],
			spr_healthPotion: [1, 0],
			spr_regenPotion: [2, 0]
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
		Crafty.sprite(16, 'assets/Jadesprite.png', {
			spr_player: [1, 0],
		});
		
		Crafty.sprite(16, 'assets/hunter.png', {
			spr_villager: [0, 2],
		}, 0, 2);
		
		Crafty.sprite(16, 'assets/zigguratWalls.png', {
			spr_wall:  [1, 0],
			spr_block: [0, 0],
			spr_door:  [2, 0],
			spr_floor: [3, 0],
			spr_corner: [4, 0]
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
		loadingText.text('To Play:<br>WASD: Controls movement<br>Space: Swings your sword<br>P: Pause<br>F: Death Grip<br>E: Consume Soul Orb<br>Mouse click: Fire Soul Orb');
		//Not, y'know, literally.
	}),
	this.begin = function() { //As soon as we're loaded, you can hit a key to start
		Crafty.scene('Game');
	};
	this.bind('KeyDown', this.begin);
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

	this.megaMap = Crafty.e('StaticMegaMap');
	this.megaMap.placeHero();
	
	//Uncomment this and the camera tracks the player!
	//Probably it should do that for outdoor scenes, but stay room-to-room for indoor ones??
	//this.camera = Crafty.e('Camera').camera(Game.player);
	Crafty.audio.play('ring'); //Little chime to signal kickoff
	
	Game.loadThoughts(); //This is problematic - see Case 167.
	
	//Every time we might have won, check if we've won
	this.show_victory = function() {
		if (!Crafty('Collectable').length) {
			Crafty.trigger('DoorsOpen');
		}
	};
	this.bind('Collected', this.show_victory);
	
	
	this.wentUp = function() {
		Crafty('StaysInRoom').destroy();
		this.megaMap.roomY--;
		this.megaMap.placeHero(this.megaMap.roomX, this.megaMap.roomY);
	};
	this.bind('WentUp', this.wentUp);
	this.wentDown = function() {
		Crafty('StaysInRoom').destroy();
		this.megaMap.roomY++;
		this.megaMap.placeHero(this.megaMap.roomX, this.megaMap.roomY);
	};
	this.bind('WentDown', this.wentDown);
	this.wentRight = function() {
		Crafty('StaysInRoom').destroy();
		this.megaMap.roomX++;
		this.megaMap.placeHero(this.megaMap.roomX, this.megaMap.roomY);
	};
	this.bind('WentRight', this.wentRight);
	this.wentLeft = function() {
		Crafty('StaysInRoom').destroy();
		this.megaMap.roomX--;
		this.megaMap.placeHero(this.megaMap.roomX, this.megaMap.roomY);
	};
	this.bind('WentLeft', this.wentLeft);
	
	//If we died, change the screen.
	this.show_defeat = function() {Crafty.scene('Defeat');};
	this.bind('HeroDied', this.show_defeat);
}, function() { //Don't leave these listeners constantly waiting around for an event, for hygiene's sake
	this.unbind('HeroDied', this.show_defeat);
	this.unbind('Collected', this.show_victory);
	this.unbind('WentUp', this.WentUp);
	this.unbind('WentDown', this.WentDown);
	this.unbind('WentLeft', this.WentLeft);
	this.unbind('WentRight', this.WentRight);
	Game.unloadThoughts();
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
		.textFont({ size: '24px', family: 'Arial', color: 'white', align: 'center' });	
	
	Crafty.audio.play('applause');
	
	//Wait before just letting you restart
	var delay = true;
	setTimeout(function() { 
		delay = false; 
		youWonText.text("Care to go another round?");
	}, 2000);
	
	//Once the delay is up, restart on the press of any key
	this.restart_game = function() {
		if (!delay) {
			Crafty.scene('Game');
		}
	};
	this.bind('KeyDown', this.restart_game);
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
		.textFont({ size: '24px', family: 'Arial', color: 'white', align: 'center' });
	
	Crafty.audio.play('knock');
	
	var delay = true;
	setTimeout(function() { 
		delay = false; 
		youLostText.text("Care to try again?");
	}, 2000);
		
	this.restart_game = function() {
		if (!delay) {
			Crafty.scene('Game');
		}
	};
	this.bind('KeyDown', this.restart_game);
}, function() {
	this.unbind('KeyDown', this.restart_game);
});
