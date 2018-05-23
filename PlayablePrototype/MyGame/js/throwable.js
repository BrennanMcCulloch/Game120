var tempPlayer;
function Throwable(game, xPos, yPos, key, frame, player) {
	if(frame != null) {
		Phaser.Sprite.call(this, game, xPos, yPos, key, frame);
	}
	else {
		Phaser.Sprite.call(this, game, xPos, yPos, key);
	}
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.body.bounce.set(0.8);
	this.body.drag.x = 100;
	this.body.drag.y = 100;

	this.isHeld = false;
	this.justDropped = false;

	tempPlayer = player;
}

Throwable.prototype = Object.create(Phaser.Sprite.prototype); //formally declares the prototype as a descendant of sprite
Throwable.prototype.constructor = Throwable; //Formally sets up the constructor

Throwable.prototype.update = function() {
	//If you're holding it, press E to not hold it anymore
	if(this.isHeld) {
		this.body.position.x = tempPlayer.position.x + 10;
		this.body.position.y = tempPlayer.position.y;

		if(game.input.keyboard.justPressed(Phaser.Keyboard.E)) {
			this.isHeld = false;
			this.justDropped = true;
		}
	}

	if(game.input.keyboard.justPressed(Phaser.Keyboard.E) == false) {
		this.justDropped = false; //A bit of a delay so the item can be dropped
	}

	//If you're not holding it, didn't just drop it, & press E with overlap, hold it
	if(checkOverlap(tempPlayer, this) && this.isHeld == false && this.justDropped == false) {
		//play prompt
		if(game.input.keyboard.justPressed(Phaser.Keyboard.E)) {
			this.isHeld = true;
		}
	}
	
	//throwing
	if(this.isHeld && game.input.mousePointer.isDown) {
		this.isHeld = false;
		this.justDropped = true;
		game.physics.arcade.moveToPointer(this, 400);
	}


}