//A StaticMegaMap uses JSON to keep track of all the rooms on a given level.
Crafty.c('StaticMegaMap', {
	init: function(){
		this.contents = [];
		this.blueprint = MegaMap1.mapData; //grab the data from the json object
		this.width = this.blueprint.width;
		this.height = this.blueprint.height;
		for (var x = 0; x < this.width; x++) { //make the array
			this.contents[x] = new Array(this.height);
			for (var y = 0; y < this.height; y++) {
				this.contents[x][y] = 0;
			}
		}
		this.makeRooms();
	},
	
	//Pull data from the JSON object and load into our contents array.
	makeRooms: function() {
		for (var roomNum = 0; roomNum < this.blueprint.rooms.length; roomNum++) { //for each room in the blueprint
			room = this.blueprint.rooms[roomNum];
			this.contents[room.x][room.y] = Crafty.e('StaticRoom').staticPopulate(room.roomType); //put the right stuff in the right room.
		}
		return this;
	},
	
	//Put the Hero in an appropriate room.
	//Call this to move between rooms.
	placeHero: function(roomX, roomY) {
		if (roomX === undefined || roomY === undefined) { //at the start of the game,
			startRoom = this.blueprint.rooms[this.blueprint.startRoom]; //put the hero at the beginning of the MegaMap
			roomX = startRoom.x;
			roomY = startRoom.y;
			room = this.contents[roomX][roomY];
			Game.player = Crafty.e('Hero').at(this.blueprint.playerStartX, this.blueprint.playerStartY);
		}
		this.roomX = roomX;
		this.roomY = roomY;
		room = this.contents[roomX][roomY];
		room.display();
		Game.player.doorsWillClose();
		Game.player.triggerDoors();
	},
});

//A static room takes a roomplan and builds a corresponding room.
Crafty.c('StaticRoom', {
	init: function() {
		this.blueprint = {};
		this.contents = [];
		this.requires('Room');
	},
	//Load contents from the given room
	staticPopulate: function(roomType) {
		this.blueprint = Rooms[roomType];
		if (this.blueprint === undefined) return;
		this.setSize();
		this.fill();
		return this;
	},
	
	//sets the right size for a room.
	setSize: function(){
		this.width = this.blueprint.width;
		this.height = this.blueprint.height;
	},
	
	//goes through the blueprint filling in the right components.
	fill: function() { 
		for (var x = 0; x < this.width; x++) {
			this.contents[x] = new Array(this.height);
			for (var y = 0; y < this.height; y++) {
				contentLine = this.blueprint.mapData[y];
				this.contents[x][y] = this.whatGoesAt(x, y, contentLine.charAt(x));
			}
		}
	},
	
	//takes a position and a symbol and converts it into a component.
	whatGoesAt: function(x, y, symbol){
		if(Legend[symbol] === undefined){ 
			if(symbol == 'X') return this.cornerRotation(x, y);
			if(symbol == 'D') return this.doorRotation(x, y);
			if(symbol == 'L') return this.lockedDoorRotation(x, y);
			return false;
		}
		return Legend[symbol];
	},
	
	//gotta put the right kind of door in!
	doorRotation: function(x,y){ 
		if(y == 0) return "TopDoorway";
		if(x == 0) return "LeftDoorway";
		if(x >= this.width - 1) return "RightDoorway";
		if(y >= this.height - 1) return "BottomDoorway";
		return "TopDoorway";
	},
	//This has got to be redundant.
	lockedDoorRotation: function(x,y){ 
		if(y == 0) return "TopLockedDoorway";
		if(x == 0) return "LeftLockedDoorway";
		if(x >= this.width - 1) return "RightLockedDoorway";
		if(y >= this.height - 1) return "BottomLockedDoorway";
		return "TopLockedDoorway";
	},
	cornerRotation: function(x, y) {
		if (x == 0 && y == 0) return "TopLeftCorner";
		else if (x == 0) return "BottomLeftCorner";
		else if (y == 0) return "TopRightCorner";
		else return "BottomRightCorner";
	},
});


//random room is no longer used, but could be later maybe?
Crafty.c('RandomRoom', {
	init: function() {
		this.requires('Room');
		this.width = Game.map_grid.width;
		this.height = Game.map_grid.height;
		this.contents = new Array(this.width);
		for (var x = 0; x < this.width; x++) {
			this.contents[x] = new Array(this.height);
			for (var y = 0; y < this.height; y++) {
				this.contents[x][y] = false;
			}
		}
		this.placedOneVillage = false;
		this.placedOneDoor = false;
		this.maxSpawningVillages = 5;
		this.spawningVillageCount = 0;
	},

	leaveEmpty: function(x, y) {
		this.contents[x][y] = 'Placeholder';
		return this;
	},
	populate: function() {
		for (var x = this.width-1; x >= 0; x--) {
			for (var y = this.height-1; y >= 0; y--) {
				this.contents[x][y] = this.whatGoesAt(x, y);
			}
		}
		if (!this.placedOneVillage) {
			do {
				x = Math.ceil(Math.random() * this.width - 2);
				y = Math.ceil(Math.random() * this.height - 2);
			}
			while (this.contents[x][y]);
			this.contents[x][y] = 'SpawningVillage';
		}
		return this;
	},
	placeObject: function(nameOfObject, x, y) {
		this.contents[x][y] = nameOfObject;
	},
	whatGoesAt: function(x, y) {
		if (this.contents[x][y])    {
               return this.contents[x][y];
        }
		if (this.wallIfEdge(x, y)) return this.wallIfEdge(x, y);
		else if (Game.chance(6) && !this.contents[x][y]) {
			// Place a bush entity at the current tile
			return (Game.chance(30)) ? 'Bush' : 'Rock';
		}
		else if (Game.chance(2) && !this.contents[x][y]) {
			return "SpikeTrap";
		}
		else if (Math.random() < 0.02 && !this.contents[x][y] && !this.contents[x][y+1]) {
			if (this.spawningVillageCount < this.maxSpawningVillages){
				this.placedOneVillage = true;
				this.spawningVillageCount++;
				return "SpawningVillage";
			}	
			else {
				return "Village";
			}	
		}
		else {
			return false;
		}
	},
	wallIfEdge: function(x, y) {
		var atTop = y == 0;
		var atBottom = y == this.height - 1;
		var atLeft = x == 0;
		var atRight = x == this.width - 1;
		var atEdge = atTop || atBottom || atLeft || atRight;
		if (atEdge) {
			if (atTop) {
				if (atLeft || atRight) {
					return 'Block';
				}
				else {
					return 'Wall';
				}
			}
			else if (atBottom) {
				if (atLeft || atRight) {
					return 'Block';
				}
				else {
					return 'BottomWall';
				}
			}
			else if (atLeft) {
				return 'LeftWall';
			}
			else if (atRight) {
				return 'RightWall';
			}
		}
		return false;
	},

	putDoorOnTop: function(x) {
		if (x === undefined) {
			//pick a random x between 1 and width - 2 (not a corner)
			x = Math.floor(Math.random() * (this.width - 2)) + 1;
		}
		this.contents[x][0] = 'Doorway';
		this.contents[x][1] = false; //Don't block the door
		this.placedOneDoor = true;
		return x;
	},
	putDoorOnRight: function(y) {
		if (y === undefined) {
			y = Math.floor(Math.random() * (this.height - 2)) + 1;
		}
		this.contents[this.width - 1][y] = 'RightDoorway';
		this.contents[this.width - 2][y] = false;
		this.placedOneDoor = true;
		return y;
	},
	putDoorOnBottom: function(x) {
		if (x === undefined) {
			//pick a random x between 1 and width - 2 (not a corner)
			x = Math.floor(Math.random() * (this.width - 2)) + 1;
		}
		this.contents[x][this.height - 1] = 'BottomDoorway';
		this.contents[x][this.height - 2] = false;
		this.placedOneDoor = true;
		return x;
	},
	putDoorOnLeft: function(y) {
		if (y === undefined) {
			y = Math.floor(Math.random() * (this.height - 2)) + 1;
		}
		this.contents[0][y] = 'LeftDoorway';
		this.contents[1][y] = false;
		this.placedOneDoor = true;
		return y;
	},
});

//Rooms hold content with which the player may interact.
Crafty.c('Room', {
	init: function() {
		contents = [];
		width = 0;
		height = 0;
	},
	
	//checks whether the hero has completed the room.
	cleared: function() {
		return !Crafty('Collectable').length;
	},
	
	//put the room on the screen.
	display: function() {
		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				if (this.contents[x][y]) {
					Crafty.e(this.contents[x][y]).at(x, y).placeInRoom(this);
				}
			}
		}
		return this;
	},	
});

