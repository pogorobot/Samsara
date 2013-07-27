
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
		this.bind('DoorsClose', function() {
			if (!this.room.cleared()) {
				this.requires('Door');
			}
		});
	}
});

Crafty.c('RightDoorway', {
	init: function() {
		this.requires('Terrain');
		this.bind('DoorsClose', function() {
			if (!this.room.cleared()) {
				this.requires('RightDoor');
			}
		});
	}
});
Crafty.c('BottomDoorway', {
	init: function() {
		this.requires('Terrain');
		this.bind('DoorsClose', function() {
			if (!this.room.cleared()) {
				this.requires('BottomDoor');
			}
		});
	}
});
Crafty.c('LeftDoorway', {
	init: function() {
		this.requires('Terrain');
		this.bind('DoorsClose', function() {
			if (!this.room.cleared()) {
				this.requires('LeftDoor');
			}
		});
	}
});

Crafty.c('Door', {
	init: function() {
		this.requires('Actor, Solid, spr_door, StopsBullets, Terrain');
		this.bind('DoorsOpen', function() {
			this.destroy();
		});
	},
	setRotation: function(rotation) {
		this.origin(this.w / 2, this.h / 2);
		this.rotation = rotation;
		return this;
	},
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
		this.z = -1;
		this.onHit('Marching', function(data) {
			var marcher = data[0].obj;
			if (this.at().x == marcher.at().x && this.at().y == marcher.at().y) {
				marcher.turn(this.rotation);
			}
		});
		this.origin(this.w/2, this.h/2);
		return this;
	},
	setRotation: function(rotation) {
		this.rotation = rotation;
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