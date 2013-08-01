//A Terrain is a static object made to be placed and kept in a room.
Crafty.c('Terrain', {
	init: function() {
		this.requires('Actor, StaysInRoom');
	},
});

// A Tree is just an Actor with a certain sprite (that is solid and stops bullets)
Crafty.c('Tree', {
	init: function() {
		this.requires('Actor, Solid, spr_tree, StopsBullets, Terrain');
	},
});

//A wall forms the boundaries of a Room, and comes in four rotated varieties.
Crafty.c('Wall', {
	init: function() {
		this.requires('Actor, Solid, spr_wall, StopsBullets, Terrain');
	},
	setRotation: function(rotation) {
		this.origin(this.w / 2, this.h / 2);
		this.rotation = rotation;
		return this;
	},
});

Crafty.c('RightWall', {
	init: function() {
		this.requires('Wall');
		this.setRotation(90);
	},
});

Crafty.c('BottomWall', {
	init: function() {
		this.requires('Wall');
		this.setRotation(180);
	},
});

Crafty.c('LeftWall', {
	init: function() {
		this.requires('Wall');
		this.setRotation(270);
	},
});

Crafty.c('Corner', {
	init: function() {
		this.requires('Wall, spr_corner');
	},
});

Crafty.c('TopRightCorner', {
	init: function() {
		this.requires('Corner');
		this.setRotation(0);
	},
});

//Stepping on a spike trap will cause you to be hurt.
Crafty.c('SpikeTrap', {
	init: function() {
		this.requires('Actor, Collision, spr_spikeTrap, Trap, Terrain');
		this.painfulness = 1;
		this.onHit('Solid', this.spring);
	},
	spring: function() {
		this.removeComponent('spr_spikeTrap');
		this.requires('HurtsToTouch, HurtsMonsters, spr_spikes, PoisonTouch');
		//Would like to make them Solid, but can't find a good way to do that without either
		//A) keeping them from ever springing
		//or B) making the hero pass through walls as soon as he springs a trap
	},
});

Crafty.c('BottomRightCorner', {
	init: function() {
		this.requires('Corner');
		this.setRotation(90);
	},
});

Crafty.c('BottomLeftCorner', {
	init: function() {
		this.requires('Corner');
		this.setRotation(180);
	},
});

Crafty.c('TopLeftCorner', {
	init: function() {
		this.requires('Corner');
		this.setRotation(270);
	},
});

// Floor is currently unused due to lag.
Crafty.c('Floor', {
	init: function() {
		this.requires('Actor, spr_floor, Terrain');
	},
});

Crafty.c('Block', {
	init: function() {
		this.requires('Actor, Solid, spr_block, StopsBullets, Terrain');
	},
});

// A Bush is just an Actor with a certain sprite (that is solid)
Crafty.c('Bush', {
	init: function() {
		this.requires('Actor, Solid, spr_bush, Terrain');
	},
});

Crafty.c('Doorway', {
	init: function() {
		this.requires('Terrain');
	},
	onCloseBecome: function(newThing) {
		this.bind('DoorsClose', function() {
			if (!this.room.cleared()) {
				this.requires(newThing);
			}
		});
	}
});

Crafty.c('TopDoorway', {
	init: function() {
		this.requires('Doorway');
		this.onCloseBecome('Door');
	}
});

Crafty.c('RightDoorway', {
	init: function() {
		this.requires('Doorway');
		this.onCloseBecome('RightDoor');
	}
});
Crafty.c('BottomDoorway', {
	init: function() {
		this.requires('Doorway');
		this.onCloseBecome('BottomDoor');
	}
});
Crafty.c('LeftDoorway', {
	init: function() {
		this.requires('Doorway');
		this.onCloseBecome('LeftDoor');
	}
});

Crafty.c('LockedDoorway', {
	init: function() {
		this.requires('Terrain');
	},
	onCloseBecome: function(newThing) {
		//locked doors don't care if the room has been cleared
		this.bind('DoorsClose', function() {
			this.requires(newThing);
		});
	}
});

Crafty.c('TopLockedDoorway', {
	init: function() {
		this.requires('LockedDoorway');
		this.onCloseBecome('LockedDoor');
	}
});

Crafty.c('RightLockedDoorway', {
	init: function() {
		this.requires('LockedDoorway');
		this.onCloseBecome('RightLockedDoor');
	}
});

Crafty.c('BottomLockedDoorway', {
	init: function() {
		this.requires('LockedDoorway');
		this.onCloseBecome('BottomLockedDoor');
	}
});

Crafty.c('LeftLockedDoorway', {
	init: function() {
		this.requires('LockedDoorway');
		this.onCloseBecome('LeftLockedDoor');
	}
});

Crafty.c('Door', {
	init: function() {
		this.requires('Actor, Solid, spr_door, StopsBullets, Terrain');
		this.bind('DoorsOpen', this.destroy);
	},
	
	setRotation: function(rotation) {
		this.origin(this.w / 2, this.h / 2);
		this.rotation = rotation;
		return this;
	},
});

Crafty.c('LockedDoor', {
	init: function() {
		this.requires('Door');
		this.unbind('DoorsOpen', this.destroy);
	}
});

Crafty.c('RightDoor', {
	init: function() {
		this.requires('Door');
		this.setRotation(90);
	},
});

Crafty.c('BottomDoor', {
	init: function() {
		this.requires('Door');
		this.setRotation(180);
	},
});

Crafty.c('LeftDoor', {
	init: function() {
		this.requires('Door');
		this.setRotation(270);
	},
});

Crafty.c('RightLockedDoor', {
	init: function() {
		this.requires('RightDoor, LockedDoor');
	},
});
Crafty.c('BottomLockedDoor', {
	init: function() {
		this.requires('BottomDoor, LockedDoor');
	},
});
Crafty.c('LeftLockedDoor', {
	init: function() {
		this.requires('LeftDoor, LockedDoor');
	},
});

//A Rock is a Solid Actor that stops bullets
Crafty.c('Rock', {
	init: function() {
		this.requires('Actor, Solid, spr_rock, StopsBullets, Terrain');
	},
});

Crafty.c('Placeholder', {
	init: function() {
		this.requires('Terrain');
	},
});


Crafty.c('Arrow', {
	init: function() {
		this.requires('Actor, spr_arrow, Collision, Terrain');
		this.dx = 0;
		this.dy = -1;
		this.z = -1;
		this.onHit('Marching', function(data) {
			var marcher = data[0].obj;
			if (this.at().x == marcher.at().x && this.at().y == marcher.at().y) {
				marcher.turn(this.dx, this.dy);
			}
		});
		this.origin(this.w/2, this.h/2);
		return this;
	},
	setRotation: function(rotation) {
		this.rotation = rotation;
		this.dx = Math.cos((this.rotation - 90) * Math.PI / 180);
		this.dy = Math.sin((this.rotation - 90) * Math.PI / 180);
		return this;
	},
});

Crafty.c('UpArrow', {
	init: function() {
		this.requires('Arrow');
		this.setRotation(0);
	}
});

Crafty.c('DownArrow', {
	init: function() {
		this.requires('Arrow');
		this.setRotation(180);
	}
});
Crafty.c('RightArrow', {
	init: function() {
		this.requires('Arrow');
		this.setRotation(90);
	}
});
Crafty.c('LeftArrow', {
	init: function() {
		this.requires('Arrow');
		this.setRotation(270);
	}
});


//This component randomly spawns new enemies
Crafty.c('SpawnPoint', {
	probability: 0,
	increasePerFrame: 0.0035,
	init: function() {
		this.requires('Terrain');
		this.bind('EnterFrame', this.thinkAboutSpawning);
	},
	thinkAboutSpawning: function() {
		var maxCollectibles = 15;
		var chanceOfSentinel = 33;
		var fleeNotSwarm = 50;
		if (Crafty('Enemy').length + Crafty('SpawningVillage').length < maxCollectibles && Game.chance(this.probability)) {
			if (Game.chance(chanceOfSentinel)) {
				var newGuy = Crafty.e('Sentinel').at(this.tileX, this.tileY + 1);
				if (newGuy.dy == -1) newGuy.turn(0, 1);
			}
			else if (Game.chance(fleeNotSwarm)) {
				var newGuy = Crafty.e('FleeingEnemy').at(this.tileX,this.tileY+1);
			}
			else {
				var newGuy = Crafty.e('SwarmingEnemy').at(this.tileX, this.tileY+1);
			}
			if (newGuy.hit('Solid')) {
				newGuy.destroy();
			}
		}
		else {
			this.probability += this.increasePerFrame;
		}
	},
});

Crafty.c('Statue', {
	init: function() {
		this.requires('Actor, Solid, spr_statue, ShootsAtPlayer, Terrain');
		this.bind('DoorsOpen', function() {
			this.unbind('EnterFrame', this.shootRandomly);
			this.removeComponent('ShootsAtPlayer');
		});
	},
});