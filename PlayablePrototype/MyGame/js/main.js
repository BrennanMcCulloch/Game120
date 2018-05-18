//Brennan McCulloch Development Branch. Adding this comment to test if my github desktop works on my laptop, which it should. 
var game = new Phaser.Game(800, 600, Phaser.AUTO); // Creates a 800 x 600 screen in which the game is displayed
var ledge, platforms, player, door, doorCheck;
var fwoosh, unlock, echoSound, echoFill;
var echoAmount = 1; 
//DARKNESS VARIABLES	
var dots;
var dotWidth = 8; //8 for pure darkness, 10 for faux transparency (MUST DIVIDE EVENLY INTO GAME.WIDTH AND GAME.HEIGHT)
//initialize the darkness array
var darkArray = new Array(game.width/dotWidth);
for(var i = 0; i < game.width/dotWidth; i++){
	darkArray[i] = new Array(game.height/dotWidth);
}
var echoX, echoY, echoRad, echoRadder, echoOn;

/*OPENING MAIN MENU!!
* Shows the player the title and prompts them to press enter to play. 
*/
var MainMenu = function(game) {};
MainMenu.prototype = {
    preload: function() {
        console.log('MainMenu: Preload');
        this.load.image('sky', 'assets/img/sky.png'); //Preloads the only image needed for this menu.
    },

    create: function() {
        console.log('MainMenu: Create');
        this.add.image(0, 0, 'sky');

        //Placing the text for this iteration of the Main Menu over the sky background.
        var hi = 'HI!'
        var introText = "Welcome to the first playable prototype.\n Press ENTER to begin. "  
        var mainMenuText = this.add.text(100, 150, hi, {font: "bold 60px Comic Sans MS"});
        mainMenuText = this.add.text(100, 250, introText, {font: "25px Comic Sans MS"});
    },

    update: function() {
        if(game.input.keyboard.justPressed(Phaser.Keyboard.ENTER)) {
            game.state.start('Stage1');
        }
    }
}

/*STAGE 1!!
* Basic puzzle that teaches movement and item interaction.  
*/
var Stage1 = function(game) {};
Stage1.prototype = {
	preload: function() {
		// preload assets
		game.load.atlas('bean', 'assets/img/bean.png', 'assets/img/bean.json'); //LOAD BEAN
		game.load.image('dot', 'assets/img/dot.png');
		//Loading in the assets we need for this stage, aside from walls
		game.load.atlas('atlas', 'assets/img/assets.png', 'assets/img/assets.json');

		console.log('Stage1: Preload');
		game.load.image('sky', 'assets/img/sky.png'); // Preload background
	    game.load.image('ground', 'assets/img/platform.png'); // Preload platform
	    game.load.image('wall', 'assets/img/wall.png');
		game.load.image('diamond', 'assets/img/diamond.png'); // Preload weight
		game.load.image('second', 'assets/img/obj.png'); // Preload object which player interacts with
		game.load.spritesheet('interact', 'assets/img/Interact.png', 32, 32); // Preload the key prompt when near interacting obj
		game.load.spritesheet('door', 'assets/img/door.png', 32, 32); // Preload door
	
		game.load.audio('fwoosh', 'assets/audio/Fwoosh.mp3');
		game.load.audio('unlock', 'assets/audio/Unlock.mp3');
		game.load.audio('echoSound', 'assets/audio/echoSound.mp3');
	},

	create: function() {
		fwoosh = game.add.audio('fwoosh');
		unlock = game.add.audio('unlock');
		echoSound = game.add.audio('echoSound');

		console.log('Stage1: Create');
	    game.physics.startSystem(Phaser.Physics.ARCADE); // We're going to be using physics, so enable the Arcade Physics system
	    game.add.image(0, 0, 'sky'); // A simple background for our game
		
		//MAKING THE WORLDBOUNDS THAT WE CANNOT ESCAPE FROM BECAUSE WE ARE DOOMED IN THIS LIFE
	    platforms = game.add.group(); // The platforms group contains the ground and the 2 ledges we can jump on
	    platforms.enableBody = true; // We will enable physics for any object that is created in this group
		
	    ledge = platforms.create(0, 450, 'ground'); // Here we create the ground.
	    ledge.scale.setTo(2, 5); // Scale it to fit the width of the game (the original sprite is 400x32 in size)
	    ledge.body.immovable = true; // This stops it from falling away when you jump on it
	    ledge = platforms.create(0, 380, 'ground'); // Bottom left of the area border
		ledge.scale.setTo(0.5, 5);
	    ledge.body.immovable = true;
	    ledge = platforms.create(600, 380, 'ground'); // Bottom right of the area border
		ledge.scale.setTo(0.5, 5);
	    ledge.body.immovable = true;
		
		ledge = platforms.create(0, 0, 'ground'); // Top center of the area border
		ledge.scale.setTo(2, 5);
	    ledge.body.immovable = true;
	    ledge = platforms.create(0, 80, 'ground'); // Top left of the area border
		ledge.scale.setTo(0.5, 5);
	    ledge.body.immovable = true;
	    ledge = platforms.create(600, 80, 'ground'); // Top right of the area border
		ledge.scale.setTo(0.5, 5);
	    ledge.body.immovable = true;

		//ITEM YOU CAN INTERACT WITH 
		flick = game.add.sprite(game.world.width/2 - 25, game.world.height/2 - 10, 'atlas', 'fire-log-00'); // Add interactable obj
		//DOOR YOU CAN USE TO LEAVE
		door = game.add.sprite(game.world.width-100, game.world.height/2, 'door') // Add door
		door.scale.setTo(2, 2);
		door.anchor.setTo(0.5, 0.5);
		door.frame = 0; // Closed door frame
		doorCheck = false; //Haven't seen the door yet

		//PLAYER STUFF
		makePlayer();

		//INTERACT PROMPT
		interact = game.add.sprite(game.world.width/2 - 25, game.world.height/2 - 50, 'interact'); // Add interacting key prompt

		/*
	    //DARKNESS STUFF
	    dots = game.add.group(); //need this so we can set the alpha
        //fill the 2d array with sprites of dots, so that they can be accessed later. 
		for(var y = 0; y < game.height / dotWidth; y ++) {
        	for(var x = 0; x < game.width / dotWidth; x ++) {
        		darkArray[x][y] = dots.create(x*dotWidth, y*dotWidth, 'dot');
        	}
		}
		*/
		var WASDText = this.add.text(player.position.x + 20, player.position.y - 30, "  W\nASD", {font: "15px Comic Sans MS"});
	},

	update: function() {
		var hitPlatform = game.physics.arcade.collide(player, platforms); // Apply colliding physics between player and platforms
		
	   	playerMovement();
	    
	    if(player.body.position.x >= 650 && doorCheck != true) {
			doorCheck = true; //They've seen the door
			fwoosh.play(); //play fire sound
		}

		//E PROMPT INTERACTION
		interact.frame = 0; // 1st frame of key prompt is empty space	
		// Source: https://phaser.io/examples/v2/sprites/overlap-without-physics
		if (checkOverlap(player, flick) && door.frame != 1 && doorCheck == true) // When player sprite overlaps interactable obj
	    {
			interact.frame = 1; // Change key prompt frame into image of key
			if(game.input.keyboard.justPressed(Phaser.Keyboard.E)) // When key prompt pressed
			{
				door.frame = 1; // Change door sprite into "open" frame
				unlock.play();
			}
	    }

		//WIN CONDITIONS
		if(checkOverlap(player, door) && door.frame == 1) 
		{
			game.state.start('Stage2');
		}

		/*
		//DARKNESS STUFF
		//Reinitialize the entire darkness array to 0
		for(var y = 0; y < game.height / dotWidth; y ++) {
        	for(var x = 0; x < game.width / dotWidth; x ++) {
        		darkArray[x][y].alpha = 1;
        	}
		}
		echoDark();
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);
		*/
		
	},

	render: function() {
		//game.debug.body(player);
	}
}

/*STAGE 2!!
* Slightly more complex puzzle that teaches navigation ideas and echolocation mechanic.  
*/
var Stage2 = function(game) {};
Stage2.prototype = {
	
	preload: function() {
		//Note: once preloaded in one state, a sprite does not need to be preloaded in any other states. 
		console.log("Stage2: Preload");
		game.load.atlas('bean', 'assets/img/bean.png', 'assets/img/bean.json');
		game.load.image('dot', 'assets/img/dot.png');
		game.load.image('star', 'assets/img/star.png'); //Powerup that gives you 1 more echolocation. 
		//in case you start in stage 2
		game.load.image('sky', 'assets/img/sky.png'); // Preload background
	    game.load.image('ground', 'assets/img/platform.png'); // Preload platform
	    game.load.image('wall', 'assets/img/wall.png');
		game.load.image('diamond', 'assets/img/diamond.png'); // Preload weight
		game.load.image('second', 'assets/img/obj.png'); // Preload object which player interacts with
		game.load.spritesheet('interact', 'assets/img/Interact.png', 32, 32); // Preload the key prompt when near interacting obj
		game.load.spritesheet('door', 'assets/img/door.png', 32, 32); // Preload door
	
		game.load.audio('unlock', 'assets/audio/Unlock.mp3');
		game.load.audio('echoSound', 'assets/audio/echoSound.mp3');
		game.load.audio('echoFill', 'assets/audio/echoFill.mp3');
	},

	create: function() {
		console.log('Stage2: Create');
		unlock = game.add.audio('unlock');
		echoSound = game.add.audio('echoSound');
		echoFill = game.add.audio('echoFill');
		
		game.add.image(0, 0, 'sky'); // A simple background for our game
		game.physics.startSystem(Phaser.Physics.ARCADE); // We're going to be using physics, so enable the Arcade Physics system
		
		//MAKING THE WORLDBOUNDS THAT WE CANNOT ESCAPE FROM BECAUSE WE ARE DOOMED IN THIS LIFE
	    platforms = game.add.group(); // The platforms group contains the ground and the 2 ledges we can jump on
	    platforms.enableBody = true; // We will enable physics for any object that is created in this group
		ledge = platforms.create(0, game.world.height - 64, 'ground'); // Here we create the ground.
	    ledge.scale.setTo(2, 2); // Scale it to fit the width of the game (the original sprite is 400x32 in size)
	    ledge.body.immovable = true; // This stops it from falling away when you jump on it	
		ledge = platforms.create(0, 0, 'ground'); // Top of the area border
		ledge.scale.setTo(2, 2);
	    ledge.body.immovable = true;
		ledge = platforms.create(775, 0, 'wall'); // Right Wall
		ledge.body.immovable = true;
		ledge = platforms.create(-25, 0, 'wall'); // Left wall
		ledge.body.immovable = true;
		ledge = platforms.create(game.world.width/4, -150, 'wall'); // gate 1 top
		ledge.scale.setTo(1, 0.5);
		ledge.body.immovable = true;
		ledge.body.setSize(60, 570, -2, 0);
		ledge = platforms.create(game.world.width/4, game.world.height/2 - 50, 'wall'); // gate 1 bottom
		ledge.body.immovable = true;
		ledge = platforms.create(game.world.width/2, -225, 'wall'); // gate 2 top
		ledge.body.immovable = true;
		ledge.body.setSize(60, 570, -2, 0);
		ledge = platforms.create(game.world.width/2, game.world.height - 100, 'wall'); // gate 2 bottom
		ledge.scale.setTo(1, 0.5);
		ledge.body.immovable = true;

		//IN THIS INSTANCE, THE PLACE YOU NEED TO BRING THE DIAMOND
		flick = game.add.sprite(550, 150, 'second');
		//DOOR YOU CAN USE TO LEAVE
		door = game.add.sprite(game.world.width-100, game.world.height/2, 'door') // Add door
		door.scale.setTo(2, 2);
		door.anchor.setTo(0.5, 0.5);
		door.frame = 0; // Closed door frame
		doorCheck = false; //IN THIS STAGE, haven't picked up the weight yet
		
		weight =  game.add.sprite(550, game.world.height - 150, 'diamond'); // Add weight
		game.physics.arcade.enable(weight); // Apply physics on weight?
		weight.body.bounce.y = 0.2;
	    weight.body.collideWorldBounds = true;

		makePlayer();

		//INTERACT PROMPT WITH WEIGHT
		interact = game.add.sprite(550, game.world.height - 200, 'interact'); // Add interacting key prompt

		echoAmount = 1; //Amount of times player can echolocate
		star = game.add.sprite(game.world.width/2, game.world.height/2 + 100, 'star'); //adds in powerup in this location
		//INITIALIZING DARKNESS STUFF
		dots = game.add.group();
		for(var y = 0; y < game.height / dotWidth; y ++) {
        	for(var x = 0; x < game.width / dotWidth; x ++) {
        		darkArray[x][y] = dots.create(x*dotWidth, y*dotWidth, 'dot');
        	}
		}

		var QText = this.add.text(player.position.x + 20, player.position.y - 30, "  Q", {font: "15px Comic Sans MS"});
	},

	update: function() {
		var hitPlatform = game.physics.arcade.collide(player, platforms); // Apply colliding physics between player and platforms
		var hitPlatform3 = game.physics.arcade.collide(weight, platforms); // Apply colliding physics between weight and platforms
		playerMovement();
		if(checkOverlap(player, star) && star.alive) { //picks up the powerup and gains the player 1 life
			star.kill();
			echoAmount++;
			echoFill.play();
		}


		//E PROMPT INTERACTION
		interact.frame = 0; // 1st frame of key prompt is empty space
		interact.position.x = weight.position.x; //The interact prompt should always appear above the diamond
		interact.position.y = weight.position.y - 40;	
		// Source: https://phaser.io/examples/v2/sprites/overlap-without-physics
		if (checkOverlap(weight, flick) && door.frame != 1) // When the weight and the destination overlap
	    {
			weight.kill(); // Removes the star from the screen
			flick.kill();
			door.frame = 1; // Change door sprite into "open" frame. You win!
			unlock.play();
	    }
		
		//HOLDING THE "WEIGHT" USING DOORCHECK
		if(doorCheck == true) {
			weight.position.x = player.position.x + 30;
			weight.position.y = player.position.y;
		}
		if(doorCheck == true && game.input.keyboard.justPressed(Phaser.Keyboard.E)) {
			doorCheck = false;
		}
		//PICKING UP THE "WEIGHT"
		if (checkOverlap(player, weight) && door.frame != 1) // When player overlaps weight
	    {
	    	interact.frame = 1;
			// Source: https://phaser.io/examples/v2/input/follow-mouse
			if (game.input.keyboard.justPressed(Phaser.Keyboard.E)) // When interact is pressed down
			{
	        //pick up the weight
	        doorCheck = true;
			}
		}

		//WIN CONDITIONS
		if(checkOverlap(player, door) && door.frame == 1) 
		{
			game.state.start('MainMenu');
		}


		//DARKNESS STUFF
		echoDark(); //enabling echolocation ability
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);
	},

	render: function() {

	}
}




//EXTRA FUNCTIONS NEEDED TO MAKE STUFF WORK

// Source: https://phaser.io/examples/v2/sprites/overlap-without-physics
function checkOverlap(player, flick) // Sets up boundaries between player and interactable obj.
{
    var boundsA = player.getBounds();
    var boundsB = flick.getBounds();
	
    return Phaser.Rectangle.intersects(boundsA, boundsB);
}

function playerMovement() {
 //Reset the players velocity (movement)
 	player.events.onAnimationComplete.add(function(){ player.animations.play('float') }, this);

	player.body.velocity.x = 0;
	player.body.velocity.y = 0;
	if(game.input.keyboard.isDown(Phaser.Keyboard.W)) // Move Up
	{
		player.body.velocity.y = -150;
		movement = true;
	}
	if (game.input.keyboard.isDown(Phaser.Keyboard.A)) // Move to the left
	{
	    player.body.velocity.x = -150;
	    player.scale.x = 0.25;
	    player.play('side');
	    movement = true;
	}
	if(game.input.keyboard.isDown(Phaser.Keyboard.S)) // Move Down
	{
		player.body.velocity.y = 150;
		movement = true;
	}
	if (game.input.keyboard.isDown(Phaser.Keyboard.D)) // Move to the right
	{
	    player.body.velocity.x = 150;
	    player.scale.x = -0.25;
	    player.play('side');
	    movement = true;
	}

	if(game.input.keyboard.justPressed(Phaser.Keyboard.E)) {
		player.animations.play('grab');
	}
}

function makePlayer() {
		player = game.add.sprite(50, game.world.height/2, 'bean', 'bean-float-00'); // The player and its settings
	    game.physics.arcade.enable(player); // We need to enable physics on the player
	    player.body.collideWorldBounds = true;
	    player.scale.setTo(0.25, 0.25);
	    player.anchor.setTo(0.5, 0.5);
	    player.animations.add('float', Phaser.Animation.generateFrameNames('bean-float-', 0, 14, '', 2));
	    player.animations.add('side', Phaser.Animation.generateFrameNames('bean-side-', 0, 15, '', 2));
	    player.animations.add('grab', Phaser.Animation.generateFrameNames('touch-', 0, 30, '', 2), 30);
	    player.animations.play('float');
}

//EXTRA FUNCTIONS NEEDED TO MAKE DARKNESS WORK
function erase(darkness, xPos, yPos, radius, innerRad) { //xPos yPos are center position, radius is how far out from center
	if(xPos >= 0 && yPos >= 0 && xPos < game.width && yPos < game.height) { //If the point is on screen
		
		//SETTING UP EDGES OF DARKNESS ERASING
		var leftBound = Math.round((xPos/dotWidth) - radius);
		if(leftBound < 0) {
			leftBound = 0;
		}
		if(leftBound > game.width/dotWidth) {
			leftBound = game.width/dotWidth;
		}
		var rightBound = Math.round((xPos/dotWidth) + radius);
		if(rightBound < 0) {
			rightBound = 0;
		}
		if(rightBound > game.width/dotWidth) {
			rightBound = game.width/dotWidth;
		}
		var upBound = Math.round((yPos/dotWidth) - radius);
		if(upBound < 0) {
			upBound = 0;
		}
		if(upBound > game.height/dotWidth) {
			upBound = game.height/dotWidth;
		}
		var downBound = Math.round((yPos/dotWidth) + radius);
		if(downBound < 0){
			downBound = 0;
		}
		if(downBound > game.height/dotWidth) {
			downBound = game.height/dotWidth;
		}

		//INNER RADIUS STUFF
		var leftIn = Math.round((xPos/dotWidth) - innerRad);
		if(leftIn < 0) {
			leftIn = 0;
		}
		if(leftIn > game.width/dotWidth) {
			leftIn = game.width/dotWidth;
		}
		var rightIn = Math.round((xPos/dotWidth) + innerRad);
		if(rightIn < 0) {
			rightIn = 0;
		}
		if(rightIn > game.width/dotWidth) {
			rightIn = game.width/dotWidth;
		}
		var upIn = Math.round((yPos/dotWidth) - innerRad);
		if(upIn < 0) {
			upIn = 0;
		}
		if(upIn > game.height/dotWidth) {
			upIn = game.height/dotWidth;
		}
		var downIn = Math.round((yPos/dotWidth) + innerRad);
		if(downIn < 0) {
			downIn = 0;
		}
		if(downIn > game.height/dotWidth) {
			downIn = game.height/dotWidth;
		}

		
		//ERASING THE DARKNESS AROUND THE POINT PASSED IN
		for(var y = upBound; y < downBound; y++) {
			for(var x = leftBound; x < rightBound; x++) {
				if(y < upIn || y > downIn || x < leftIn || x > rightIn) {
						darkness[x][y].alpha = 0;
				}
			}
		}

	}
}

function echoDark() {
	//Reinitialize the entire darkness array to 0
	for(var y = 0; y < game.height / dotWidth; y ++) {
        for(var x = 0; x < game.width / dotWidth; x ++) {
        	darkArray[x][y].alpha = 1;
        }
	}
	//If Q is pressed, enable echolocation
    if(game.input.keyboard.justPressed(Phaser.Keyboard.Q) && echoAmount > 0) {
    	echoX = player.position.x;
    	echoY = player.position.y;
    	echoRadder = 7;
    	echoRad = echoRadder - 7;
    	echoOn = true;
    	echoAmount--;
    	echoSound.play();
    }
    //echolocation loop uses same erase function, but syncs it with the update loop
    if(echoOn) {
    	erase(darkArray, echoX, echoY, echoRadder, echoRad);
		echoRadder += 1;
		echoRad += 1;
    	if(echoX - (echoRad*dotWidth) < 0 && echoX + (echoRad*dotWidth) > game.width && echoY - (echoRad*dotWidth) < 0 && echoY + (echoRad*dotWidth) > game.height) {
    		echoOn = false;
    	}
    }
}

//Adds all of the game states to the game so that we can switch between them. 
game.state.add('MainMenu', MainMenu);
game.state.add('Stage1', Stage1);
game.state.add('Stage2', Stage2);
//Actually starts the game in our Main Menu state!
game.state.start('MainMenu');