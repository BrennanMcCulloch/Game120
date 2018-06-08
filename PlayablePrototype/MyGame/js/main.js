//Development Branch
var game = new Phaser.Game(800, 600, Phaser.AUTO); // Creates a 800 x 600 screen in which the game is displayed
var ledge, platforms, torches, player, door, doorCheck, match, flick;
var fwoosh, unlock, echoSound, echoFill, lookBack;
var music, whispers, fireWhispers;
var keys; //enabling key movement
var echoAmount = 1; 
var credits = "Door unlocking: https://www.youtube.com/watch?v=u9y5G7qTTWM\nFire starting: https://www.youtube.com/watch?v=PC8UOakQuWY\nEcholocation: https://www.youtube.com/watch?v=4GPSM8clbE0\nRocks hitting: https://www.youtube.com/watch?v=pcRXp8NN-m8";
var style = { font: "10px Papyrus", fill: "#ffffff"};
//DARKNESS VARIABLES	
var dots;
var dotWidth = 8; //8 for pure darkness, 10 for faux transparency (MUST DIVIDE EVENLY INTO GAME.WIDTH AND GAME.HEIGHT)
//initialize the darkness array
var darkArray = new Array(game.width/dotWidth);
for(var i = 0; i < game.width/dotWidth; i++){
	darkArray[i] = new Array(game.height/dotWidth);
}
var echoX, echoY, echoRad, echoRadder, echoOn;

var Booting = function(game) {};
Booting.prototype = {
	preload: function() {
		game.load.image('ground', 'assets/img/platform.png');
	},

	create: function() {
		game.state.start('Preloading');
	}

}

var Preloading = function(game) {};
Preloading.prototype = {
	preload: function() {
		this.loadingBar = this.add.sprite(game.width / 2, game.height / 2, 'ground');
		this.loadingBar.anchor.setTo(0.5, 0.5);
		this.load.setPreloadSprite(this.loadingBar);

		//CORE ASSETS
        game.load.atlas('bean', 'assets/img/bean.png', 'assets/img/bean.json'); //LOAD BEAN
        game.load.image('dot', 'assets/img/dot.png');

        //ATLASES
        game.load.atlas('atlas', 'assets/img/assets.png', 'assets/img/assets.json');
        game.load.atlas('atlasTwo', 'assets/img/assets2.png', 'assets/img/assets2.json');

        //ENCVIRONMENTAL ASSETS
        game.load.image('title', 'assets/img/title.png');
        game.load.image('sky', 'assets/img/sky.png'); // Preload background
        game.load.spritesheet('door', 'assets/img/door.png', 32, 32); // Preload door
        game.load.image('star', 'assets/img/star.png'); //Powerup that gives you 1 more echolocation.
        game.load.image('wall', 'assets/img/wall.png');
        game.load.image('clickDown', 'assets/img/mouseclick.png');
        game.load.image('rock', 'assets/img/rock1.png');
        game.load.image('white', 'assets/img/white.png'); //the heavenly void

        //AUDIO ASSETS
        game.load.audio('fwoosh', 'assets/audio/Fwoosh.mp3');
        game.load.audio('fire', 'assets/audio/Fire.wav');
        game.load.audio('whispers', 'assets/audio/Whispers.wav');
        game.load.audio('music', 'assets/audio/Music.wav');
        game.load.audio('unlock', 'assets/audio/Unlock.mp3');
		game.load.audio('echoSound', 'assets/audio/echoSound.mp3');
		game.load.audio('echoFill', 'assets/audio/echoFill.mp3');
		game.load.audio('lookBack', 'assets/audio/lookBack.mp3');
		game.load.audio('rockHit', 'assets/audio/rockHit.mp3');

		//TEMP ASSETS
		game.load.image('diamond', 'assets/img/diamond.png'); // Preload weight
		game.load.image('second', 'assets/img/obj.png'); // Preload object which player interacts with
	},

	create: function() {
		//To get rid of debugging problems
		fireWhispers = game.add.audio('fire');
		fireWhispers.volume = 0.5;
		fireWhispers.loop = true;
		music = game.add.audio('music');
		music.volume = 0.3;
		music.loop = true;
		whispers = game.add.audio('whispers');
		whispers.volume = 0.5;
		whispers.loop = true;

		game.state.start('MainMenu');
	}

}

/*OPENING MAIN MENU!!
* Shows the player the title and prompts them to press enter to play. 
*/
var MainMenu = function(game) {};
MainMenu.prototype = {
    preload: function() {
        console.log('MainMenu: Preload');
    },

    create: function() {
        console.log('MainMenu: Create');
        game.add.image(0, 0, 'title');
        doorCheck = false; //does the player want to see credits?

        fwoosh = game.add.audio('fwoosh');
		fwoosh.play();
		fireWhispers = game.add.audio('fire');
		fireWhispers.volume = 0.5;
		fireWhispers.loop = true;
		fireWhispers.play();

		//setting up music
		if(music && whispers) {
			music.stop();
			whispers.stop();
		}
		music = game.add.audio('music');
		music.volume = 0.3;
		music.loop = true;
		whispers = game.add.audio('whispers');
		whispers.volume = 0.5;
		whispers.loop = true;

		flick = game.add.sprite(305, 225, 'atlasTwo', 'fire-00'); // Add interactable obj
		flick.animations.add('alight', Phaser.Animation.generateFrameNames('fire-', 0, 5, '', 2));
		flick.animations.play('alight', 10, true);
		flick.scale.setTo(0.75, 0.75);

		//credits text
		this.MainMenuText = game.add.text(5, 325, credits, style);
		this.extraText = game.add.text(255, 520, "Press C to toggle credits\nPress ENTER on any stage to restart\nMusic by Jose Beck", {font: "15px Papyrus", fill: "#ffffff", align: "center"});


		ledge = game.add.sprite(300, 425, 'ground');
		ledge.scale.setTo(0.2, 2);
		ledge.alpha = 0;
		ledge.inputEnabled = true; //makes it so we can click on it
		ledge.events.onInputDown.add(function(){game.state.start('Stage1'); fireWhispers.stop(); music.play(); whispers.play();}, this);  //When you click on the play button, start stage1      
    
		makePlayer();
		player.position.x = game.width/2 - 25;
    },

    update: function() {
    	playerMovement();

    	//text stuff
    	if(game.input.keyboard.justPressed(Phaser.Keyboard.C)) {
    		doorCheck = !doorCheck;
    	}
    	if(doorCheck) {
    		this.MainMenuText.alpha = 1;
    	} else {
    		this.MainMenuText.alpha = 0;
    	}
    }
}

/*STAGE 1!!
* Basic puzzle that teaches movement and item interaction.  
*/
var Stage1 = function(game) {};
Stage1.prototype = {
	preload: function() {
		console.log('Stage1: Preload');
	},

	create: function() {
		fwoosh = game.add.audio('fwoosh');
		unlock = game.add.audio('unlock');
		echoSound = game.add.audio('echoSound');
		lookBack = game.add.audio('lookBack');
		lookBack.volume = 0.5;

		console.log('Stage1: Create');
	    game.physics.startSystem(Phaser.Physics.ARCADE); // We're going to be using physics, so enable the Arcade Physics system
	    game.add.image(0, 0, 'sky'); // A simple background for our game
		
		//Making the platforms the player and rocks cannot get across
		//MAKING THE WORLDBOUNDS THAT WE CANNOT ESCAPE FROM BECAUSE WE ARE DOOMED IN THIS LIFE
	    platforms = game.add.group(); // The platforms group contains the ground and the 2 ledges we can jump on
	    platforms.enableBody = true; // We will enable physics for any object that is created in this group
	    ledge = platforms.create(0, 450, 'ground'); // Here we create the ground.
	    ledge.body.immovable = true; // This stops it from falling away when you jump on it
	    ledge = platforms.create(0, 380, 'ground'); // Bottom left of the area border
		ledge.scale.setTo(0.25, 2);
	    ledge.body.immovable = true;
	    ledge = platforms.create(600, 380, 'ground'); // Bottom right of the area border
		ledge.scale.setTo(0.25, 2);
	    ledge.body.immovable = true;
		ledge = platforms.create(0, 80, 'ground'); // Top center of the area border
	    ledge.body.immovable = true;
	    ledge = platforms.create(0, 100, 'ground'); // Top left of the area border
		ledge.scale.setTo(0.25, 2);
	    ledge.body.immovable = true;
	    ledge = platforms.create(600, 100, 'ground'); // Top right of the area border
		ledge.scale.setTo(0.25, 2);
	    ledge.body.immovable = true;

		//ITEM YOU CAN INTERACT WITH 
		flick = game.add.sprite(game.world.width/2 - 10, game.world.height/2 + 30, 'atlas', 'torch'); // Add interactable obj
		flick.animations.add('alight', Phaser.Animation.generateFrameNames('fire-torch-', 0, 5, '', 2));
		flick.scale.setTo(0.5, 0.5);
		flick.anchor.setTo(0.5, 0.5);
		//DOOR YOU CAN USE TO LEAVE
		door = game.add.sprite(game.world.width-100, game.world.height/2 + 10, 'door') // Add door
		door.scale.setTo(2, 2);
		door.anchor.setTo(0.5, 0.5);
		door.frame = 0; // Closed door frame
		doorCheck = false; //Haven't seen the door yet

		//PLAYER STUFF
		makePlayer();

		//INTERACT PROMPT
		interact = game.add.sprite(game.world.width/2 - 20, game.world.height/2 - 40, 'atlas', 'e'); // Add interacting key prompt
		interact.scale.setTo(0.5, 0.55);

		WASDText = game.add.sprite(player.position.x + 20, player.position.y - 20, 'atlas', 'wasd');
		WASDText.scale.setTo(0.2, 0.2);
		
	   //DARKNESS STUFF
	    dots = game.add.group(); //need this so we can set the alpha
        //fill the 2d array with sprites of dots, so that they can be accessed later. 
		for(var y = 0; y < game.height / dotWidth; y ++) {
        	for(var x = 0; x < game.width / dotWidth; x ++) {
        		darkArray[x][y] = dots.create(x*dotWidth, y*dotWidth, 'dot');
        	}
		}
	},

	update: function() {
		//Restart the stage
    	if(game.input.keyboard.justPressed(Phaser.Keyboard.ENTER)) {
    		game.state.start('Stage1');
    		fireWhispers.stop();
    	}
		var hitPlatform = game.physics.arcade.collide(player, platforms); // Apply colliding physics between player and platforms
		
	   	playerMovement();
	    
	    if(player.body.position.x >= 650 && doorCheck != true) {
			doorCheck = true; //They've seen the door
			lookBack.play(); //play fire sound
		}

		//E PROMPT INTERACTION
		interact.alpha = 0; // 1st frame of key prompt is empty space	
		// Source: https://phaser.io/examples/v2/sprites/overlap-without-physics
		if (checkOverlap(player, flick) && door.frame != 1 && doorCheck == true) // When player sprite overlaps interactable obj
	    {
			interact.alpha = 1; // Change key prompt frame into image of key
			if(game.input.keyboard.justPressed(Phaser.Keyboard.E)) // When key prompt pressed
			{
				door.frame = 1; // Change door sprite into "open" frame
				unlock.play();
				fwoosh.play();
				fireWhispers.play();
				flick.animations.play('alight', 10, true);
				flick.position.y = flick.position.y - 19; //resetting sprite height
			}
	    }

		//WIN CONDITIONS
		if(checkOverlap(player, door) && door.frame == 1) 
		{
			game.state.start('Stage2');
			fireWhispers.stop();
		}

		
		//DARKNESS STUFF
		//Reinitialize the entire darkness array to 0
		echoDark();
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);
		if(doorCheck == true && door.frame == 1){
			erase(darkArray, flick.position.x, flick.position.y, 7, -1);
		}
		
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
	},

	create: function() {
		console.log('Stage2: Create');
		fwoosh = game.add.audio('fwoosh');
		unlock = game.add.audio('unlock');
		echoSound = game.add.audio('echoSound');
		echoFill = game.add.audio('echoFill');
		
		game.add.image(0, 0, 'sky'); // A simple background for our game
		game.physics.startSystem(Phaser.Physics.ARCADE); // We're going to be using physics, so enable the Arcade Physics system
		
		//MAKING THE WORLDBOUNDS THAT WE CANNOT ESCAPE FROM BECAUSE WE ARE DOOMED IN THIS LIFE
	    platforms = game.add.group(); // The platforms group contains the ground and the 2 ledges we can jump on
	    platforms.enableBody = true; // We will enable physics for any object that is created in this group
		ledge = platforms.create(game.world.width/4, -225, 'wall'); // gate 1 top
		ledge.body.immovable = true;
		ledge.body.setSize(60, 570, -2, 0);
		ledge = platforms.create(game.world.width/4, game.world.height -100, 'wall'); // gate 1 bottom
		ledge.body.immovable = true;
		ledge = platforms.create(game.world.width/2, -450, 'wall'); // gate 2 top
		ledge.body.immovable = true;
		ledge.body.setSize(60, 570, -2, 0);
		ledge = platforms.create(game.world.width/2, game.world.height/2 - 50, 'wall'); // gate 2 bottom
		ledge.body.immovable = true;

		//IN THIS INSTANCE, THE PLACE YOU NEED TO BRING THE DIAMOND
		flick = game.add.sprite(550, 180, 'atlas', 'sticks');
		flick.scale.setTo(0.3, 0.3);
		flick.anchor.setTo(0.5, 0.5);
		flick.animations.add('alight', Phaser.Animation.generateFrameNames('fire-log-', 0, 5, '', 2));
		//DOOR YOU CAN USE TO LEAVE
		door = game.add.sprite(game.world.width-100, game.world.height/2, 'door') // Add door
		door.scale.setTo(2, 2);
		door.anchor.setTo(0.5, 0.5);
		door.frame = 0; // Closed door frame
		doorCheck = false; //IN THIS STAGE, haven't picked up the weight yet
		
		weight =  game.add.sprite(550, game.world.height - 150, 'atlas', 'gascan'); // Add weight
		game.physics.arcade.enable(weight); // Apply physics on weight?
		weight.scale.setTo(0.3, 0.3);
	    weight.body.collideWorldBounds = true;
		weight.body.bounce.set(0.8);
		weight.body.drag.x = 100;
		weight.body.drag.y = 100;

		makePlayer();

		//INTERACT PROMPT WITH WEIGHT
		interact = game.add.sprite(550, game.world.height - 200, 'atlas', 'e'); // Add interacting key prompt
		interact.scale.setTo(0.5, 0.5);

		echoAmount = 1; //Amount of times player can echolocate
		star = game.add.sprite(game.world.width/2 + 50, game.world.height/2 - 125, 'star'); //adds in powerup in this location

		QText = game.add.sprite(player.position.x + 20, player.position.y - 20, 'atlas', 'q');
		QText.scale.setTo(0.5, 0.5);
		QText = game.add.sprite(450, 150, 'atlas', 'q');
		QText.scale.setTo(0.5, 0.5);

		
		//INITIALIZING DARKNESS STUFF
		dots = game.add.group();
		for(var y = 0; y < game.height / dotWidth; y ++) {
        	for(var x = 0; x < game.width / dotWidth; x ++) {
        		darkArray[x][y] = dots.create(x*dotWidth, y*dotWidth, 'dot');
        	}
		}
		
	},

	update: function() {
		//Restart the stage
    	if(game.input.keyboard.justPressed(Phaser.Keyboard.ENTER)) {
    		game.state.start('Stage2');
    		fireWhispers.stop();
    	}
		var hitPlatform = game.physics.arcade.collide(player, platforms); // Apply colliding physics between player and platforms
		var hitPlatform3 = game.physics.arcade.collide(weight, platforms); // Apply colliding physics between weight and platforms
		playerMovement();
		if(checkOverlap(player, star) && star.alive) { //picks up the powerup and gains the player 1 life
			star.kill();
			echoAmount++;
			echoFill.play();
		}


		//E PROMPT INTERACTION
		interact.alpha = 0; // 1st frame of key prompt is empty space
		interact.position.x = weight.position.x + 5; //The interact prompt should always appear above the diamond
		interact.position.y = weight.position.y - 40;	
		// Source: https://phaser.io/examples/v2/sprites/overlap-without-physics
		if (checkOverlap(weight, flick) && door.frame != 1) // When the weight and the destination overlap
	    {
			weight.kill(); // Removes the star from the screen
			flick.animations.play('alight', 10, true);
			flick.position.y = flick.position.y - 28; //resetting sprite height
			door.frame = 1; // Change door sprite into "open" frame. You win!
			unlock.play();
			fwoosh.play();
			fireWhispers.play();
	    }
		
		//HOLDING THE "WEIGHT" USING DOORCHECK
		if(doorCheck == true) {
			weight.position.x = player.position.x + 30;
			weight.position.y = player.position.y;
		}
		if(doorCheck == true && game.input.keyboard.justPressed(Phaser.Keyboard.E)) {
			doorCheck = false;
		}
		// Source: https://phaser.io/examples/v2/input/follow-mouse
			if (doorCheck == true && game.input.mousePointer.isDown) // When mouse is pressed down
			{
	        //  400 is the speed it will move towards the mouse
	        doorCheck = false;
			game.physics.arcade.moveToPointer(weight, 400); // Weight follows where the mouse cursor is located
			}
		//PICKING UP THE "WEIGHT"
		if (checkOverlap(player, weight) && door.frame != 1 && doorCheck == false) // When player overlaps weight
	    {
	    	interact.alpha = 1;
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
			game.state.start('Stage3');
			fireWhispers.stop();
		}

		
		//DARKNESS STUFF
		echoDark(); //enabling echolocation ability
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);
		if(door.frame == 1) {
			erase(darkArray, flick.position.x, flick.position.y - 10, 7, -1);
		}
		
	},

	render: function() {

	}
}

/*STAGE 3!!
* Tutorial stage for throwing objects.
* We'll leave this up to Nithin to build, since he created it.  
*/
var Stage3 = function(game) {};
Stage3.prototype = {
	
	preload: function() {
		//Note: once preloaded in one state, a sprite does not need to be preloaded in any other states. 
		console.log("Stage3: Preload");
	},

	create: function() {
		console.log('Stage3: Create');
		unlock = game.add.audio('unlock');
		echoSound = game.add.audio('echoSound');
		echoFill = game.add.audio('echoFill');
		fwoosh = game.add.audio('fwoosh');
		
		game.add.image(0, 0, 'sky'); // A simple background for our game
		game.physics.startSystem(Phaser.Physics.ARCADE); // We're going to be using physics, so enable the Arcade Physics system
		
		var click = game.add.sprite(game.width/2 - 35, 150, 'clickDown');
		click.scale.setTo(0.75, 0.75);

		//MAKING THE WORLDBOUNDS THAT WE CANNOT ESCAPE FROM BECAUSE WE ARE DOOMED IN THIS LIFE
	    platforms = game.add.group(); // The platforms group contains the ground and the 2 ledges we can jump on
	    platforms.enableBody = true; // We will enable physics for any object that is created in this group
		ledge = platforms.create(0, game.world.height - 64, 'ground'); // Here we create the ground.
	    ledge.scale.setTo(2, 2); // Scale it to fit the width of the game (the original sprite is 400x32 in size)
	    ledge.body.immovable = true; // This stops it from falling away when you jump on it	
		ledge = platforms.create(0, 0, 'ground'); // Top of the area border
		ledge.scale.setTo(2, 2);
	    ledge.body.immovable = true;
		ledge = platforms.create(0, 200, 'ground'); // horizontal
		ledge.scale.setTo(.5, 1);
	    ledge.body.immovable = true;
		ledge = platforms.create(game.world.width - 350, 200, 'ground'); // horizontal
	    ledge.body.immovable = true;
		ledge = platforms.create(775, 0, 'wall'); // Right Wall
		ledge.body.immovable = true;
		ledge = platforms.create(-25, 0, 'wall'); // Left wall
		ledge.body.immovable = true;
		ledge = platforms.create(355, game.world.height/2 - 100, 'wall'); // gate 1 bottom
		ledge.body.immovable = true;
		ledge.scale.setTo(1, 0.45);
		ledge = platforms.create(445, game.world.height/2 - 100, 'wall'); // gate 2 bottom
		ledge.body.immovable = true;
		ledge.scale.setTo(1, 0.45);

		//IN THIS INSTANCE, THE PLACE YOU NEED TO BRING THE DIAMOND
		flick = game.add.sprite(game.world.width/2 + 14, game.world.height/2 + 225, 'atlasTwo', 'car');
		flick.anchor.setTo(0.5, 0.5);
		flick.animations.add('alight', Phaser.Animation.generateFrameNames('carfire-', 0, 3, '', 2));

		//game.world.width/2, game.world.height/2 + 100
		//DOOR YOU CAN USE TO LEAVE
		door = game.add.sprite(game.world.width - 60, 140, 'door') // Add door
		door.scale.setTo(2, 2);
		door.anchor.setTo(0.5, 0.5);
		door.frame = 0; // Closed door frame
		doorCheck = false; //IN THIS STAGE, haven't picked up the weight yet
		
		weight =  game.add.sprite(game.world.width/2 + 40, 128, 'atlasTwo', 'molotov-00'); // Add weight
		weight.animations.add('alight', Phaser.Animation.generateFrameNames('molotov-', 0, 9, '', 2));
		weight.animations.play('alight', 10, true);
		weight.scale.setTo(0.5, 0.5);
		game.physics.arcade.enable(weight); // Apply physics on weight?
	    weight.body.collideWorldBounds = true;
		weight.body.bounce.set(0.8);
		weight.body.drag.x = 100;
		weight.body.drag.y = 100;
		
		makePlayer();
		player.position.y = 150;

		//INTERACT PROMPT WITH WEIGHT
		interact = game.add.sprite(550, game.world.height - 200, 'atlas', 'e'); // Add interacting key prompt
		interact.scale.setTo(0.5, 0.5);

		echoAmount = 1; //Amount of times player can echolocate
		star = game.add.sprite(200, 115, 'star'); //adds in powerup in this location
		//INITIALIZING DARKNESS STUFF
		dots = game.add.group();
		for(var y = 0; y < game.height / dotWidth; y ++) {
        	for(var x = 0; x < game.width / dotWidth; x ++) {
        		darkArray[x][y] = dots.create(x*dotWidth, y*dotWidth, 'dot');
        	}
		}
	},

	update: function() {
		//Restart the stage
    	if(game.input.keyboard.justPressed(Phaser.Keyboard.ENTER)) {
    		game.state.start('Stage3');
    		fireWhispers.stop();
    	}
		var hitPlatform = game.physics.arcade.collide(player, platforms); // Apply colliding physics between player and platforms
		var hitPlatform3 = game.physics.arcade.collide(weight, platforms); // Apply colliding physics between weight and platforms
		playerMovement();
		if(checkOverlap(player, star) && star.alive) { //picks up the powerup and gains the player 1 life
			star.kill();
			echoAmount++;
			echoFill.play();
		}

		//E PROMPT INTERACTION
		interact.alpha = 0; // 1st frame of key prompt is empty space
		interact.position.x = weight.position.x + 10; //The interact prompt should always appear above the diamond
		interact.position.y = weight.position.y - 30;
		// Source: https://phaser.io/examples/v2/sprites/overlap-without-physics
		if (checkOverlap(weight, flick) && door.frame != 1) // When the weight and the destination overlap
	    {
			weight.kill(); // Removes the star from the screen
			flick.position.y = flick.position.y - 10;
			flick.animations.play('alight', 10, true);
			door.frame = 1; // Change door sprite into "open" frame. You win!
			unlock.play();
			fwoosh.play();
			fireWhispers.play();
	    }
		
		//HOLDING THE "WEIGHT" USING DOORCHECK
		if(doorCheck == true) {
			weight.position.x = player.position.x + 30;
			weight.position.y = player.position.y - 20;
		}
		if(doorCheck == true && game.input.keyboard.justPressed(Phaser.Keyboard.E)) {
			doorCheck = false;
		}
		// Source: https://phaser.io/examples/v2/input/follow-mouse
			if (doorCheck == true && game.input.mousePointer.isDown) // When mouse is pressed down
			{
	        //  400 is the speed it will move towards the mouse
	        doorCheck = false;
			game.physics.arcade.moveToPointer(weight, 400); // Weight follows where the mouse cursor is located
			}
		//PICKING UP THE "WEIGHT"
		if (checkOverlap(player, weight) && door.frame != 1) // When player overlaps weight
	    {
	    	interact.alpha = 1;
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
			game.state.start('Stage4');
			fireWhispers.stop();
		}


		//DARKNESS STUFF
		echoDark(); //enabling echolocation ability
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);
		if(door.frame) {
			//light the car on fire\
			erase(darkArray, flick.position.x - 40, flick.position.y - 10, 7, -1);
			erase(darkArray, flick.position.x + 40, flick.position.y - 10, 7, -1);
		}
		else {
			//light the bottle on fire
			erase(darkArray, weight.position.x + 10, weight.position.y + 25, 4, -1);
		}
	},

	render: function() {

	}
}


/*STAGE 4!!
* Slightly more complex puzzle that teaches navigation ideas and echolocation mechanic.  
*/
var Stage4 = function(game) {};
Stage4.prototype = {
	
	preload: function() {
		//Note: once preloaded in one state, a sprite does not need to be preloaded in any other states. 
		console.log("Stage4: Preload");
	},

	create: function() {
		console.log('Stage4: Create');
		unlock = game.add.audio('unlock');
		echoSound = game.add.audio('echoSound');
		echoFill = game.add.audio('echoFill');
		
		game.add.image(0, 0, 'sky'); // A simple background for our game
		game.physics.startSystem(Phaser.Physics.ARCADE); // We're going to be using physics, so enable the Arcade Physics system
		
		//MAKING THE WORLDBOUNDS THAT WE CANNOT ESCAPE FROM BECAUSE WE ARE DOOMED IN THIS LIFE
	    platforms = game.add.group(); // The platforms group contains the ground and the 2 ledges we can jump on
	    platforms.enableBody = true; // We will enable physics for any object that is created in this group
		ledge = platforms.create(0, game.world.height - 30, 'ground'); // Here we create the ground.
	    ledge.scale.setTo(2, 1); // Scale it to fit the width of the game (the original sprite is 400x32 in size)
	    ledge.body.immovable = true; // This stops it from falling away when you jump on it	
		ledge = platforms.create(0, 0, 'ground'); // Top of the area border
		ledge.scale.setTo(2, 1);
	    ledge.body.immovable = true;

		ledge = platforms.create(500, 400, 'ground'); // right horizontal wall
		ledge.scale.setTo(.4, 1);
	    ledge.body.immovable = true;
		ledge = platforms.create(game.world.width - 300, 32, 'wall'); // right vertical wall
		ledge.scale.setTo(1, 0.7);
	    ledge.body.immovable = true;

	    ledge = platforms.create(0, 200, 'ground'); // left horizontal wall
		ledge.scale.setTo(.4, 1);
	    ledge.body.immovable = true;
		ledge = platforms.create(300, 200, 'wall'); // left vertical wall
		ledge.scale.setTo(1, 0.7);
	    ledge.body.immovable = true;

		ledge = platforms.create(775, 0, 'wall'); // Right Wall
		ledge.body.immovable = true;
		ledge = platforms.create(-25, 0, 'wall'); // Left wall
		ledge.body.immovable = true;

		//IN THIS INSTANCE, THE PLACE YOU NEED TO BRING THE DIAMOND
		flick = game.add.sprite(game.world.width/2 + 100, game.world.height/2 + 200, 'atlas', 'sticks');
		flick.scale.setTo(0.3, 0.3);
		flick.anchor.setTo(0.5, 0.5);
		flick.animations.add('alight', Phaser.Animation.generateFrameNames('fire-log-', 0, 5, '', 2));
		//game.world.width/2, game.world.height/2 + 100
		//DOOR YOU CAN USE TO LEAVE
		door = game.add.sprite(game.world.width - 60, game.world.height/2 + 210, 'door') // Add door
		door.scale.setTo(2, 2);
		door.anchor.setTo(0.5, 0.5);
		door.frame = 0; // Closed door frame
		doorCheck = false; //IN THIS STAGE, haven't picked up the weight yet
		
		weight =  game.add.sprite(400, 128, 'atlasTwo', 'flare-00'); // Add weight
		weight.animations.add('alight', Phaser.Animation.generateFrameNames('flare-', 0, 5, '', 2));
		weight.animations.play('alight', 10, true);
		weight.scale.setTo(0.75, 0.75);
		game.physics.arcade.enable(weight); // Apply physics on weight?
	    weight.body.collideWorldBounds = true;
		weight.body.bounce.set(0.8);
		weight.body.drag.x = 100;
		weight.body.drag.y = 100;

		makePlayer();
		player.position.y = 125;

		//INTERACT PROMPT WITH WEIGHT
		interact = game.add.sprite(550, game.world.height - 200, 'atlas', 'e'); // Add interacting key prompt
		interact.scale.setTo(0.5, 0.5);

		echoAmount = 1; //Amount of times player can echolocate
		star = game.add.sprite(300, 115, 'star'); //adds in powerup in this location
		//INITIALIZING DARKNESS STUFF
		dots = game.add.group();
		for(var y = 0; y < game.height / dotWidth; y ++) {
        	for(var x = 0; x < game.width / dotWidth; x ++) {
        		darkArray[x][y] = dots.create(x*dotWidth, y*dotWidth, 'dot');
        	}
		}
	},

	update: function() {
		//Restart the stage
    	if(game.input.keyboard.justPressed(Phaser.Keyboard.ENTER)) {
    		game.state.start('Stage4');
    		fireWhispers.stop();
    	}
		var hitPlatform = game.physics.arcade.collide(player, platforms); // Apply colliding physics between player and platforms
		var hitPlatform3 = game.physics.arcade.collide(weight, platforms); // Apply colliding physics between weight and platforms
		playerMovement();
		if(checkOverlap(player, star) && star.alive) { //picks up the powerup and gains the player 1 life
			star.kill();
			echoAmount++;
			echoFill.play();
		}

		//E PROMPT INTERACTION
		interact.alpha = 0; // 1st frame of key prompt is empty space
		interact.position.x = weight.position.x + 10; //The interact prompt should always appear above the diamond
		interact.position.y = weight.position.y - 30;
		// Source: https://phaser.io/examples/v2/sprites/overlap-without-physics
		if (checkOverlap(weight, flick) && door.frame != 1) // When the weight and the destination overlap
	    {
			weight.kill(); // Removes the star from the screen
			flick.animations.play('alight', 10, true);
			door.frame = 1; // Change door sprite into "open" frame. You win!
			unlock.play();
			fwoosh.play();
			fireWhispers.play();
	    }
		
		//HOLDING THE "WEIGHT" USING DOORCHECK
		if(doorCheck == true) {
			weight.position.x = player.position.x + 30;
			weight.position.y = player.position.y;
		}
		if(doorCheck == true && game.input.keyboard.justPressed(Phaser.Keyboard.E)) {
			doorCheck = false;
		}
		// Source: https://phaser.io/examples/v2/input/follow-mouse
			if (doorCheck == true && game.input.mousePointer.isDown) // When mouse is pressed down
			{
	        //  400 is the speed it will move towards the mouse
	        doorCheck = false;
			game.physics.arcade.moveToPointer(weight, 1000); // Weight follows where the mouse cursor is located
			}
		//PICKING UP THE "WEIGHT"
		if (checkOverlap(player, weight) && door.frame != 1) // When player overlaps weight
	    {
	    	interact.alpha = 1;
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
			game.state.start('Stage5');
			fireWhispers.stop();
		}


		//DARKNESS STUFF
		echoDark(); //enabling echolocation ability
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);
		if(door.frame) {
			erase(darkArray, flick.position.x, flick.position.y - 10, 7, -1);
		}
		else {
			erase(darkArray, weight.position.x + 70, weight.position.y, 4, -1);
		}
	},

	render: function() {

	}
}

/*STAGE 5!!
* Player has to light a match on fire and throw it into the wood pile across the gap.
*/
var Stage5 = function(game) {};
Stage5.prototype = {
	
	preload: function() {
		console.log("Stage5: Preload");
	},
	
	create: function() {
		console.log("Stage5: Create");
		fwoosh = game.add.audio('fwoosh');
		unlock = game.add.audio('unlock');
		echoSound = game.add.audio('echoSound');
		echoFill = game.add.audio('echoFill');
		game.add.image(0, 0, 'sky');
		doorCheck = false; //is the torch on fire?
		echoAmount = 1; 

		platforms = game.add.group();
		platforms.enableBody = true;
		ledge = platforms.create(450, 0, 'wall'); // Right Wall
		ledge.body.immovable = true;

		//making torches a new group so that the matches group can overlap with it
		torches = game.add.group();
		torches.enableBody = true;
		torches.scale.setTo(0.5, 0.5); //reduces size of all members of the group, but halves their natural xy pos.
		ledge = torches.create(270, 100, 'atlas', 'torch'); //left side of door
		ledge = torches.create(470, 100, 'atlas', 'torch'); //right side of door
		ledge = torches.create(1300, 300, 'atlas', 'torch'); //above burn pile
		ledge = torches.create(1300, 700, 'atlas', 'torch'); //below burn pile
		//plays the animation on all members of the torches group
		torches.callAll('animations.add', 'animations', 'alight', Phaser.Animation.generateFrameNames('fire-torch-', 0, 5, '', 2));
		torches.callAll('play', null, 'alight', 10, true);

		//thing to light on fire
		flick = game.add.sprite(670, 300, 'atlas', 'sticks');
		flick.scale.setTo(0.5, 0.5);
		flick.anchor.setTo(0.5, 0.5);
		flick.animations.add('alight', Phaser.Animation.generateFrameNames('fire-log-', 0, 5, '', 2));
		//door to exit from
		door = game.add.sprite(200, 100, 'door') // Add door
		door.scale.setTo(2, 2);
		door.anchor.setTo(0.5, 0.5);
		door.frame = 0;

		//THROWABLE DISPENSER
		dispenser = game.add.sprite(100, 500, 'atlasTwo', 'matchbox');

		makePlayer();

		//e prompts
		interactDispenser = game.add.sprite(dispenser.position.x + 50, dispenser.position.y - 50, 'atlas', 'e'); // Add interacting key prompt
		interactDispenser.scale.setTo(0.5, 0.5);
		interact = game.add.sprite(800, 600, 'atlas', 'e'); //over the match
		interact.scale.setTo(0.5, 0.5);

		match = new Throwable(game, 1000, 1000, 'atlasTwo', 'matches', player);
		game.add.existing(match);
		match.scale.setTo(0.5, 0.5);
		match.animations.add('alight', Phaser.Animation.generateFrameNames('matchfire-', 0, 5, '', 2));
		match.animations.add('off', ['matches']); //animation of a single sprite. It's off, b. 

		//INITIALIZING DARKNESS STUFF
		dots = game.add.group();
		for(var y = 0; y < game.height / dotWidth; y ++) {
        	for(var x = 0; x < game.width / dotWidth; x ++) {
        		darkArray[x][y] = dots.create(x*dotWidth, y*dotWidth, 'dot');
        	}
		}
	},

	update: function() {
		//Restart the stage
    	if(game.input.keyboard.justPressed(Phaser.Keyboard.ENTER)) {
    		game.state.start('Stage5');
    		fireWhispers.stop();
    	}
		var hitPlatform = game.physics.arcade.collide(player, platforms); // Apply colliding physics between player and platforms
		interactDispenser.alpha = 0;
		interact.alpha = 0;

		playerMovement();

		//when an unlit match overlaps a lit torch, play the animation for a lit match & set doorCheck to true
		game.physics.arcade.overlap(match, torches, function(){match.animations.play('alight', 10, true); doorCheck = true;}, null, this);

		//If the match overlaps the sticks, AND the match is on fire, light the sticks on fire and open the door
		if(match && checkOverlap(match, flick)) {
			if(doorCheck) {
				if(door.frame != 1) {
					flick.animations.play('alight', 10, true);
					flick.position.y = flick.position.y - 23; //resetting sprite height
					unlock.play();
					fwoosh.play();
					fireWhispers.play();
				}
				door.frame = 1;
			}
		}

		//check overlap between player and dispenser. If you press e, pop out a new match and kill the previous match and its interact.
		if(checkOverlap(player, dispenser)) {
			interactDispenser.alpha = 1; //show e prompt
			if(game.input.keyboard.justPressed(Phaser.Keyboard.E)) {
				match.position.x = 250;
				match.position.y = 500;
				match.body.velocity.x = 0;
				match.body.velocity.y = 0;
				match.animations.play('off');
				doorCheck = false;
			}
		}

		//if the player and match overlap and the match isnt being held, show the interact prompt
		if(match && checkOverlap(player, match) && match.isHeld == false) {
			interact.alpha = 1;
			interact.position.x = match.position.x;
			interact.position.y = match.position.y - 20; 
		}

		if(checkOverlap(player, door) && door.frame == 1){
			game.state.start('Stage6');
			fireWhispers.stop();
		}
		
		//DARKNESS STUFF
		echoDark(); //enabling echolocation ability
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);
		erase(darkArray, door.position.x, door.position.y, 10, -1);
		erase(darkArray, 670, 360, 10, -1); //flick bottom
		erase(darkArray, 670, 230, 10, -1); //flick top
		if(doorCheck) {
			erase(darkArray, match.position.x + 40, match.position.y + 10, 2, -1);
		}
		if(door.frame == 1) {
			erase(darkArray, flick.position.x, flick.position.y - 10, 7, -1);
		}
	},

	render: function() {
	/*	game.debug.body(player);
		if(match){
			game.debug.body(match);
		}*/
	}
}

/*STAGE 6!!
* Player has to navigate through a maze and carry a torch to a woodpile to open the door.
*/
var Stage6 = function(game) {};
Stage6.prototype = {
	preload: function() {
		console.log("Stage6: Preload");
	},

	create: function() {
		console.log("Stage6: Create");
		game.add.image(0, 0, 'sky');
		fwoosh = game.add.audio('fwoosh');
		unlock = game.add.audio('unlock');
		echoSound = game.add.audio('echoSound');
		echoFill = game.add.audio('echoFill');
		doorCheck = false; //used in this stage mainly to prevent the sprite flying off screen
		echoAmount = 1; 

		//Making the maze
		var makePlats = true;
		while(makePlats == true) { //WHILE LOOP TO MAKE THE PLATFORMS COLLAPSIBLE IN SUBLIME
			platforms = game.add.group();
			platforms.enableBody = true;
			ledge = platforms.create(0, 0, 'wall'); // entrance top
			ledge.body.immovable = true;
			ledge.scale.setTo(1, 0.4);
			ledge = platforms.create(0, 350, 'wall'); // entrance bottom
			ledge.body.immovable = true;
			ledge.scale.setTo(1, 0.4);
			ledge = platforms.create(150, 100, 'wall'); // vertical to right of entrance, up
			ledge.body.immovable = true;
			ledge.scale.setTo(0.5, 0.2);
			ledge = platforms.create(150, 350, 'wall'); // vertical to right of entrance, down
			ledge.body.immovable = true;
			ledge.scale.setTo(0.5, 0.2);
			ledge = platforms.create(275, 0, 'wall'); // lane 3, up
			ledge.body.immovable = true;
			ledge.scale.setTo(0.5, 0.2);
			ledge = platforms.create(275, 225, 'wall'); //lane 3, down
			ledge.body.immovable = true;
			ledge.scale.setTo(0.5, 0.2);
			ledge = platforms.create(390, 350, 'wall'); // lane 4 down
			ledge.body.immovable = true;
			ledge.scale.setTo(0.5, 0.4);
			ledge = platforms.create(390, 100, 'wall'); // lane 4 up
			ledge.body.immovable = true;
			ledge.scale.setTo(0.5, 0.2);
			ledge = platforms.create(505, 150, 'wall'); // lane 5
			ledge.body.immovable = true;
			ledge.scale.setTo(0.5, 0.55);
			ledge = platforms.create(620, 0, 'wall'); // lane 6
			ledge.body.immovable = true;
			ledge.scale.setTo(0.5, 0.2);
			ledge = platforms.create(140, 100, 'ground'); //row 1
			ledge.body.immovable = true;
			ledge.scale.setTo(0.35, 0.5);
			ledge = platforms.create(160, 220, 'ground'); //row 2 left
			ledge.body.immovable = true;
			ledge.scale.setTo(0.175, 0.5);
			ledge = platforms.create(525, 220, 'ground'); //row 2 right
			ledge.body.immovable = true;
			ledge.scale.setTo(0.175, 0.5);
			ledge = platforms.create(40, 350, 'ground'); //row 3 left
			ledge.body.immovable = true;
			ledge.scale.setTo(0.175, 0.5);
			ledge = platforms.create(525, 350, 'ground'); //row 3 right
			ledge.body.immovable = true;
			ledge.scale.setTo(0.35, 0.5);
			ledge = platforms.create(160, 440, 'ground'); //row 4
			ledge.body.immovable = true;
			ledge.scale.setTo(0.175, 0.5);

			makePlats = false;
		}

		//wood pile to burn
		flick = game.add.sprite(720, 70, 'atlas', 'sticks');
		flick.scale.setTo(0.5, 0.5);
		flick.anchor.setTo(0.5, 0.5);
		flick.animations.add('alight', Phaser.Animation.generateFrameNames('fire-log-', 0, 5, '', 2));

		//Door to leave
		door = game.add.sprite(650, 475, 'door') // Add door
		door.scale.setTo(2, 2);
		door.anchor.setTo(0.5, 0.5);
		door.frame = 0;

		//powerup placement
		star = game.add.sprite(200, 350, 'star'); //adds in powerup in this location
		star2 = game.add.sprite(500, 50, 'star'); //adds in powerup in this location

		makePlayer();

		//adding in new torch / flare to throw around
		match = new Throwable(game, 200, 25, 'atlasTwo', 'flare-00', player);
		game.add.existing(match);
		match.scale.setTo(0.5, 0.5);
		match.animations.add('alight', Phaser.Animation.generateFrameNames('flare-', 0, 5, '', 2));
		match.animations.play('alight', 10, true);
		//Match interact
		interact = game.add.sprite(match.position.x, match.position.y - 25, 'atlas', 'e'); //over the match
		interact.scale.setTo(0.5, 0.5);


		//INITIALIZING DARKNESS STUFF
		dots = game.add.group();
		for(var y = 0; y < game.height / dotWidth; y ++) {
        	for(var x = 0; x < game.width / dotWidth; x ++) {
        		darkArray[x][y] = dots.create(x*dotWidth, y*dotWidth, 'dot');
        	}
		}
	},

	update: function() {
		//Restart the stage
    	if(game.input.keyboard.justPressed(Phaser.Keyboard.ENTER)) {
    		game.state.start('Stage6');
    		fireWhispers.stop();
    	}
		var hitPlatform = game.physics.arcade.collide(player, platforms); // Apply colliding physics between player and platforms
		hitPlatform = game.physics.arcade.collide(match, platforms);
		interact.alpha = 0;
		if(match && checkOverlap(player, match) && match.isHeld == false) {
			interact.alpha = 1;
			interact.position.x = match.position.x;
			interact.position.y = match.position.y - 20; 
		}

		//powerup 1 check
		if(checkOverlap(player, star) && star.alive) { //picks up the powerup and gains the player 1 life
			star.kill();
			echoAmount++;
			echoFill.play();
		}
		//powerup 2 check
		if(checkOverlap(player, star2) && star2.alive) { //picks up the powerup and gains the player 1 life
			star2.kill();
			echoAmount++;
			echoFill.play();
		}
		playerMovement();

		if(checkOverlap(match, flick)) {
			match.kill();
			flick.animations.play('alight', 10, true);
			if(doorCheck == false) {
				flick.position.y = flick.position.y - 23; //resetting sprite height
				unlock.play();
				fwoosh.play();
				fireWhispers.play();
				doorCheck = true;
			}
			door.frame = 1;
		}

		if(checkOverlap(player, door) && door.frame == 1) {
			game.state.start('Stage7');
			fireWhispers.stop();
		}

		//DARKNESS STUFF
		echoDark(); //enabling echolocation ability
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);
		if(door.frame == 1) {
			erase(darkArray, flick.position.x, flick.position.y - 10, 7, -1);
		}
		else {
			erase(darkArray, match.position.x + 40, match.position.y + 5, 2, -1);
		}
	},

	render: function() {

	}
}

/*STAGE 7!!
* Player has to throw two rocks together at a high enough speed over the woodpile to create a spark and open the door.
*/
var Stage7 = function(game) {};
Stage7.prototype = {

	preload: function() {
		console.log("Stage7: Preload");
	},

	create: function() {
		console.log("Stage7: Create");
		game.add.image(0, 0, 'sky');
		fwoosh = game.add.audio('fwoosh');
		unlock = game.add.audio('unlock');
		echoSound = game.add.audio('echoSound');
		echoFill = game.add.audio('echoFill');
		rockHit = game.add.audio('rockHit');
		doorCheck = false;
		echoAmount = 1;

		//Making the platforms the player and rocks cannot get across
		//MAKING THE WORLDBOUNDS THAT WE CANNOT ESCAPE FROM BECAUSE WE ARE DOOMED IN THIS LIFE
	    platforms = game.add.group(); // The platforms group contains the ground and the 2 ledges we can jump on
	    platforms.enableBody = true; // We will enable physics for any object that is created in this group
	    ledge = platforms.create(0, 450, 'ground'); // Here we create the ground.
	   // ledge.scale.setTo(1, 3); // Scale it to fit the width of the game (the original sprite is 400x32 in size)
	    ledge.body.immovable = true; // This stops it from falling away when you jump on it
	    ledge = platforms.create(0, 380, 'ground'); // Bottom left of the area border
		ledge.scale.setTo(0.25, 2);
	    ledge.body.immovable = true;
	    ledge = platforms.create(600, 380, 'ground'); // Bottom right of the area border
		ledge.scale.setTo(0.25, 2);
	    ledge.body.immovable = true;
		ledge = platforms.create(0, 80, 'ground'); // Top center of the area border
		//ledge.scale.setTo(1, 3);
	    ledge.body.immovable = true;
	    ledge = platforms.create(0, 100, 'ground'); // Top left of the area border
		ledge.scale.setTo(0.25, 2);
	    ledge.body.immovable = true;
	    ledge = platforms.create(600, 100, 'ground'); // Top right of the area border
		ledge.scale.setTo(0.25, 2);
	    ledge.body.immovable = true;

		//thing to light on fire
		flick = game.add.sprite(500, 300, 'atlas', 'sticks');
		flick.scale.setTo(0.5, 0.5);
		flick.anchor.setTo(0.5, 0.5);
		flick.animations.add('alight', Phaser.Animation.generateFrameNames('fire-log-', 0, 5, '', 2));

		door = game.add.sprite(600, 300, 'door') // Add door
		door.scale.setTo(2, 2);
		door.anchor.setTo(0.5, 0.5);
		door.frame = 0;

		makePlayer();

		//adding in the rocks that the player has to throw together
		rockOne = new Throwable(game, 200, game.height/2, 'rock', null, player);
		game.add.existing(rockOne);
		rockOne.scale.setTo(0.5, 0.5);
		rockTwo = new Throwable(game, 300, game.height/2, 'rock', null, player);
		game.add.existing(rockTwo);
		rockTwo.scale.setTo(0.5, 0.5);

		//Interact prompts for the rocks
		interactOne = game.add.sprite(rockOne.position.x + 10, rockOne.position.y - 20, 'atlas', 'e'); //over the match
		interactOne.scale.setTo(0.5, 0.5);
		interactTwo = game.add.sprite(rockTwo.position.x + 10, rockTwo.position.y - 20, 'atlas', 'e'); //over the match
		interactTwo.scale.setTo(0.5, 0.5);
	
		//INITIALIZING DARKNESS STUFF
		dots = game.add.group();
		for(var y = 0; y < game.height / dotWidth; y ++) {
        	for(var x = 0; x < game.width / dotWidth; x ++) {
        		darkArray[x][y] = dots.create(x*dotWidth, y*dotWidth, 'dot');
        	}
		}
	},

	update: function() {
		//Restart the stage
    	if(game.input.keyboard.justPressed(Phaser.Keyboard.ENTER)) {
    		game.state.start('Stage7');
    		fireWhispers.stop();
    	}
		var hitPlatform = game.physics.arcade.collide(player, platforms); // Apply colliding physics between player and platforms
		hitPlatform = game.physics.arcade.collide(rockOne, platforms);
		hitPlatform = game.physics.arcade.collide(rockTwo, platforms);

		playerMovement();

		//Interact prompt implementation for both rocks
		interactOne.alpha = 0;
		interactOne.position.x = rockOne.position.x + 10;
		interactOne.position.y = rockOne.position.y - 20;
		if(checkOverlap(player, rockOne) && rockOne.isHeld == false) {
			interactOne.alpha = 1;
		}
		interactTwo.alpha = 0;
		interactTwo.position.x = rockTwo.position.x + 10;
		interactTwo.position.y = rockTwo.position.y - 20;
		if(checkOverlap(player, rockTwo) && rockTwo.isHeld == false) {
			interactTwo.alpha = 1;
		}

		//If the two rocks are stuck together, push them apart so the player can't pick them both up simultaneously
		if(checkOverlap(rockOne, rockTwo) && rockOne.isHeld == false && rockTwo.isHeld == false) {
			if(rockOne.body.velocity.x == 0 && rockOne.body.velocity.y == 0 && rockTwo.body.velocity.x == 0 && rockTwo.body.velocity.y == 0) {
				rockOne.body.velocity.x = 20;
			}
		}

		//THE BIG IF STATEMENT FOR WIN CONDITION
		if(checkOverlap(rockOne, rockTwo)) { //If the two rocks overlap...
			//at a high enough speed...
			if(rockOne.body.velocity.x > 70 || rockOne.body.velocity.y > 70 || rockTwo.body.velocity.x > 70 || rockTwo.body.velocity.y > 70) {
				rockHit.play(); //Play the rock hitting sound
				//over the firewood...
				if(checkOverlap(rockOne, flick) && checkOverlap(rockTwo, flick)){
					//You start the fire!!
					if(doorCheck == false) {
						if(door.frame != 1) {
							flick.animations.play('alight', 10, true);
							flick.position.y = flick.position.y - 23; //resetting sprite height
							unlock.play();
							fwoosh.play();
							fireWhispers.play();
						}
					door.frame = 1;
					doorCheck = true;
					}
				}
			}
		}

		//If the doorframe is correct and the player overlaps it, leave
		if(checkOverlap(player, door) && door.frame == 1) {
			game.state.start('Stage8');
			fireWhispers.stop();
		}
	
		//DARKNESS STUFF
		echoDark(); //enabling echolocation ability
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);
		if(door.frame == 1) {
			erase(darkArray, flick.position.x, flick.position.y, 7, -1);
		}
	},

	render: function() {

	}
}

/*STAGE 8!!
* The final stage Nithin's building.
*/
var Stage8 = function(game) {};
Stage8.prototype = {
	preload: function() {
		console.log("Stage8: Preload");
	},

	create: function() {
		console.log("Stage8: Create");
		game.add.image(0, 0, 'sky');
		fwoosh = game.add.audio('fwoosh');
		unlock = game.add.audio('unlock');
		echoSound = game.add.audio('echoSound');
		echoFill = game.add.audio('echoFill');
		doorCheck = false; //used in this stage mainly to prevent the sprite flying off screen
		echoAmount = 1; 


		//Making the maze
		var makePlats = true;
		while(makePlats == true) { //WHILE LOOP TO MAKE THE PLATFORMS COLLAPSIBLE IN SUBLIME
			platforms = game.add.group();
			platforms.enableBody = true;
			ledge = platforms.create(0, 0, 'wall'); // entrance top
			ledge.body.immovable = true;
			ledge.scale.setTo(1, 0.4);
			ledge = platforms.create(0, 350, 'wall'); // entrance bottom
			ledge.body.immovable = true;
			ledge.scale.setTo(1, 0.4);
			ledge = platforms.create(140, 110, 'wall'); // left wall box
			ledge.body.immovable = true;
			ledge.scale.setTo(.5, 0.6);
			ledge = platforms.create(657, 110, 'wall'); // right wall box
			ledge.body.immovable = true;
			ledge.scale.setTo(.5, 0.6);
			ledge = platforms.create(320, 225, 'wall'); // left wall box inside
			ledge.body.immovable = true;
			ledge.scale.setTo(.5, 0.4);
			ledge = platforms.create(480, 225, 'wall'); // right wall box inside
			ledge.body.immovable = true;
			ledge.scale.setTo(.5, 0.4);
			ledge = platforms.create(140, 110, 'ground'); //upper ground box
			ledge.body.immovable = true;
			ledge.scale.setTo(0.68, 0.5);
			ledge = platforms.create(145, 440, 'ground'); //lower ground box left
			ledge.body.immovable = true;
			ledge.scale.setTo(0.25, 0.5);
			ledge = platforms.create(480, 440, 'ground'); //lower ground box right
			ledge.body.immovable = true;
			ledge.scale.setTo(0.25, 0.5);
			ledge = platforms.create(240, 225, 'wall'); // left wall box inside 2
			ledge.body.immovable = true;
			ledge.scale.setTo(.5, 0.2);
			ledge = platforms.create(560, 225, 'wall'); // right wall box inside 2
			ledge.body.immovable = true;
			ledge.scale.setTo(.5, 0.2);
			ledge = platforms.create(240, 225, 'ground'); //lower ground box left 2
			ledge.body.immovable = true;
			ledge.scale.setTo(0.13, 0.5);
			ledge = platforms.create(480, 225, 'ground'); //lower ground box right 2
			ledge.body.immovable = true;
			ledge.scale.setTo(0.13, 0.5);
			makePlats = false;
		}

		//wood pile to burn
		flick = game.add.sprite(110, 50, 'atlas', 'sticks');
		flick.scale.setTo(0.5, 0.5);
		flick.anchor.setTo(0.5, 0.5);
		flick.animations.add('alight', Phaser.Animation.generateFrameNames('fire-log-', 0, 5, '', 2));

		//Door to leave
		door = game.add.sprite(705, 500, 'door') // Add door
		door.scale.setTo(2, 2);
		door.anchor.setTo(0.5, 0.5);
		door.frame = 0;

		//powerup placement
		star = game.add.sprite(515, 275, 'star'); //adds in powerup in this location

		makePlayer();

		//adding in new torch / flare to throw around
		match = new Throwable(game, 285, 260, 'atlas', 'torch', player);
		game.add.existing(match);
		match.scale.setTo(0.25, 0.25);
		match.animations.add('alight', Phaser.Animation.generateFrameNames('fire-torch-', 0, 5, '', 2));
		match.animations.play('alight', 10, true);
		//Match interact
		interact = game.add.sprite(match.position.x, match.position.y - 25, 'atlas', 'e'); //over the match
		interact.scale.setTo(0.5, 0.5);


		//INITIALIZING DARKNESS STUFF
		dots = game.add.group();
		for(var y = 0; y < game.height / dotWidth; y ++) {
        	for(var x = 0; x < game.width / dotWidth; x ++) {
        		darkArray[x][y] = dots.create(x*dotWidth, y*dotWidth, 'dot');
        	}
		}
	},

	update: function() {
		//Restart the stage
    	if(game.input.keyboard.justPressed(Phaser.Keyboard.ENTER)) {
    		game.state.start('Stage8');
    		fireWhispers.stop();
    	}

		var hitPlatform = game.physics.arcade.collide(player, platforms); // Apply colliding physics between player and platforms
		hitPlatform = game.physics.arcade.collide(match, platforms);
		interact.alpha = 0;
		if(match && checkOverlap(player, match) && match.isHeld == false) {
			interact.alpha = 1;
			interact.position.x = match.position.x;
			interact.position.y = match.position.y - 20; 
		}

		//powerup 1 check
		if(checkOverlap(player, star) && star.alive) { //picks up the powerup and gains the player 1 life
			star.kill();
			echoAmount++;
			echoFill.play();
		}
		
		playerMovement();

		if(checkOverlap(match, flick)) {
			match.kill();
			flick.animations.play('alight', 10, true);
			if(doorCheck == false) {
				flick.position.y = flick.position.y - 23; //resetting sprite height
				unlock.play();
				fwoosh.play();
				doorCheck = true;
				fireWhispers.play();
			}
			door.frame = 1;
		}

		if(checkOverlap(player, door) && door.frame == 1) {
			game.state.start('Stage9');
			fireWhispers.stop();
		}

		//DARKNESS STUFF
		echoDark(); //enabling echolocation ability
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);
		if(door.frame == 1) {
			erase(darkArray, flick.position.x, flick.position.y - 10, 7, -1);
		}
		else {
			erase(darkArray, match.position.x + 10, match.position.y + 15, 2, -1);
		}
	},
	render: function() {

	}
}

/*STAGE 9!!
* The final stage Brennan's building. Incorporates all of the core mechanics.
*/
var Stage9 = function(game) {};
Stage9.prototype = {
	preload: function() {
		console.log("Stage9: Preload");
	},
	create: function() {
		console.log("Stage9: Create");
		game.add.image(0, 0, 'sky');
		echoAmount = 1;
		fwoosh = game.add.audio('fwoosh');
		unlock = game.add.audio('unlock');
		echoSound = game.add.audio('echoSound');
		echoFill = game.add.audio('echoFill');
		rockHit = game.add.audio('rockHit');
		this.matchOn = false; //Has the match been lit?
		doorCheck = false; //have you opened the door?

		door = game.add.sprite(500, 300, 'door') // Add door
		door.scale.setTo(2, 2);
		door.anchor.setTo(0.5, 0.5);
		door.frame = 0;

		//sticks to light on fire
		flick = game.add.sprite(725, 300, 'atlas', 'sticks');
		flick.scale.setTo(0.5, 0.5);
		flick.anchor.setTo(0.5, 0.5);
		flick.animations.add('alight', Phaser.Animation.generateFrameNames('fire-log-', 0, 5, '', 2));


		makePlayer();
		player.position.x = 440;
		//Creating the platforms of the stage in a while loop so it's collapsible in sublime & I don't have to look at it
		var makePlats = true;
		while(makePlats) {
			platforms = game.add.group();
			platforms.enableBody = true;
			ledge = platforms.create(100, 175, 'wall'); // col 1
			ledge.body.immovable = true;
			ledge.scale.setTo(1, 0.4);
			ledge = platforms.create(200, 0, 'wall'); // col 2 top
			ledge.body.immovable = true;
			ledge.scale.setTo(1, 0.2);
			ledge = platforms.create(200, 250, 'wall'); // col 2 middle
			ledge.body.immovable = true;
			ledge.scale.setTo(1, 0.2);
			ledge = platforms.create(200, 500, 'wall'); // col 2 bottom
			ledge.body.immovable = true;
			ledge.scale.setTo(1, 0.2);
			ledge = platforms.create(350, 250, 'wall'); // col 3
			ledge.body.immovable = true;
			ledge.scale.setTo(1, 0.4);
			ledge = platforms.create(450, 0, 'wall'); // col 4 top
			ledge.body.immovable = true;
			ledge.scale.setTo(1, 0.2);
			ledge = platforms.create(450, 500, 'wall'); // col 4 bottom
			ledge.body.immovable = true;
			ledge.scale.setTo(1, 0.2);
			ledge = platforms.create(600, 125, 'wall'); // col 5
			ledge.body.immovable = true;
			ledge.scale.setTo(1, 0.6);
			ledge = platforms.create(325, 100, 'ground'); // row 1 middle
			ledge.body.immovable = true;
			ledge.scale.setTo(0.25, 1);
			ledge = platforms.create(600, 100, 'ground'); // row 1 right
			ledge.body.immovable = true;
			ledge.scale.setTo(0.25, 1);
			ledge = platforms.create(125, 210, 'ground'); // row 2
			ledge.body.immovable = true;
			ledge.scale.setTo(0.15, 1);
			ledge = platforms.create(200, 350, 'ground'); // row 3
			ledge.body.immovable = true;
			ledge.scale.setTo(0.2, 1);
			ledge = platforms.create(350, 460, 'ground'); // row 1 middle
			ledge.body.immovable = true;
			ledge.scale.setTo(0.23, 1);
			ledge = platforms.create(600, 460, 'ground'); // row 1 right
			ledge.body.immovable = true;
			ledge.scale.setTo(0.25, 1);

			makePlats = false;
		}

		//powerup placement
		star = game.add.sprite(150, 300, 'star'); //adds in powerup in this location
		star2 = game.add.sprite(400, 50, 'star'); //adds in powerup in this location
		star3 = game.add.sprite(650, 550, 'star'); //Adds in powerup in this location

		//adding in the rocks that the player has to throw together
		rockOne = new Throwable(game, 700, 50, 'rock', null, player);
		game.add.existing(rockOne);
		rockOne.scale.setTo(0.5, 0.5);
		rockTwo = new Throwable(game, 350, 550, 'rock', null, player);
		game.add.existing(rockTwo);
		rockTwo.scale.setTo(0.5, 0.5);

		//Making the torch you have to throw the rocks onto to light it
		match = new Throwable(game, 300, 300, 'atlas', 'torch', player);
		game.add.existing(match);
		match.scale.setTo(0.25, 0.25);
		match.animations.add('alight', Phaser.Animation.generateFrameNames('fire-torch-', 0, 5, '', 2));
		match.animations.add('off', ['torch']); //animation of a single sprite. It's off, b. 

		//Interact prompts for the rocks & match
		interactOne = game.add.sprite(rockOne.position.x + 10, rockOne.position.y - 20, 'atlas', 'e'); //over the match
		interactOne.scale.setTo(0.5, 0.5);
		interactTwo = game.add.sprite(rockTwo.position.x + 10, rockTwo.position.y - 20, 'atlas', 'e'); //over the match
		interactTwo.scale.setTo(0.5, 0.5);
		interactThree = game.add.sprite(match.position.x + 10, match.position.y - 20, 'atlas', 'e'); //over the match
		interactThree.scale.setTo(0.5, 0.5);

		//candle for a bit of foreshadowing
		flicker = game.add.sprite(760, 300, 'atlasTwo', 'unlit-candle'); // Add interactable obj
		flicker.animations.add('alight', Phaser.Animation.generateFrameNames('litcandle-', 0, 5, '', 2));
		flicker.animations.play('alight', 10, true);
		flicker.scale.setTo(0.5, 0.5);

		//INITIALIZING DARKNESS STUFF
		dots = game.add.group();
		for(var y = 0; y < game.height / dotWidth; y ++) {
        	for(var x = 0; x < game.width / dotWidth; x ++) {
        		darkArray[x][y] = dots.create(x*dotWidth, y*dotWidth, 'dot');
        	}
		}
	},
	update: function() {
		//Restart the stage
    	if(game.input.keyboard.justPressed(Phaser.Keyboard.ENTER)) {
    		game.state.start('Stage9');
    		fireWhispers.stop();
    	}
		var hitPlatform = game.physics.arcade.collide(player, platforms);
		hitPlatform = game.physics.arcade.collide(rockOne, platforms);
		hitPlatform = game.physics.arcade.collide(rockTwo, platforms);

		playerMovement();

		//powerup 1 check
		if(checkOverlap(player, star) && star.alive) { //picks up the powerup and gains the player 1 life
			star.kill();
			echoAmount++;
			echoFill.play();
		}
		//powerup 2 check
		if(checkOverlap(player, star2) && star2.alive) { //picks up the powerup and gains the player 1 life
			star2.kill();
			echoAmount++;
			echoFill.play();
		}
		//powerup 3 check
		if(checkOverlap(player, star3) && star3.alive) { //picks up the powerup and gains the player 1 life
			star3.kill();
			echoAmount++;
			echoFill.play();
		}

		//Interact prompt implementation for both rocks & the match
		interactOne.alpha = 0;
		interactOne.position.x = rockOne.position.x + 10;
		interactOne.position.y = rockOne.position.y - 20;
		if(checkOverlap(player, rockOne) && rockOne.isHeld == false) {
			interactOne.alpha = 1;
		}
		interactTwo.alpha = 0;
		interactTwo.position.x = rockTwo.position.x + 10;
		interactTwo.position.y = rockTwo.position.y - 20;
		if(checkOverlap(player, rockTwo) && rockTwo.isHeld == false) {
			interactTwo.alpha = 1;
		}
		interactThree.alpha = 0;
		interactThree.position.x = match.position.x;
		interactThree.position.y = match.position.y - 30;
		if(checkOverlap(player, match) && match.isHeld == false) {
			interactThree.alpha = 1;
		}

		//If the two rocks are stuck together, push them apart so the player can't pick them both up simultaneously
		if(checkOverlap(rockOne, rockTwo) && rockOne.isHeld == false && rockTwo.isHeld == false) {
			if(rockOne.body.velocity.x == 0 && rockOne.body.velocity.y == 0 && rockTwo.body.velocity.x == 0 && rockTwo.body.velocity.y == 0) {
				rockOne.body.velocity.x = 20;
			}
		}

		//Step 1: collide the rocks over the lamp to light it
		if(checkOverlap(rockOne, rockTwo)) { //If the two rocks overlap...
			//at a high enough speed...
			if(rockOne.body.velocity.x > 70 || rockOne.body.velocity.y > 70 || rockTwo.body.velocity.x > 70 || rockTwo.body.velocity.y > 70) {
				rockHit.play(); //Play the rock hitting sound
				//over the matches...
				if(checkOverlap(rockOne, match) && checkOverlap(rockTwo, match)){
					match.animations.play('alight', 10, true);
					this.matchOn = true;
				}
			}
		}

		//Step 2: Throw the lamp over the sticks to light the fire
		if(checkOverlap(flick, match) && this.matchOn == true){
			//You start the fire!!
			if(doorCheck == false) {
				if(door.frame != 1) {
					flick.animations.play('alight', 10, true);
					flick.position.y = flick.position.y - 23; //resetting sprite height
					unlock.play();
					fwoosh.play();
					fireWhispers.play();
				}
			door.frame = 1;
			doorCheck = true;
			}
		}

		if(checkOverlap(player, door) && door.frame == 1) {
			game.state.start('StageEnd');
			fireWhispers.stop();
		}

		//DARKNESS STUFF
		echoDark(); //enabling echolocation ability
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);
		erase(darkArray, flicker.position.x + 15, flicker.position.y + 15, 3, -1);
		if(door.frame == 1) {
			erase(darkArray, flick.position.x, flick.position.y - 25, 7, -1);
		}
		if(this.matchOn) {
			erase(darkArray, match.position.x + 10, match.position.y + 15, 2, -1);
		}
	},
	render: function() {

	}
}

/*STAGE END!!
* Artsy Fartsy ending stage where the player can see the full background for a little bit, and then everything fades to white.
*/
var StageEnd = function(game) {};
StageEnd.prototype = {

	preload: function() {
		console.log("StageEnd: Preload");
	},

	create: function() {
		console.log("StageEnd: Create");
		game.add.image(0, 0, 'sky');
		echoAmount = 1; 

		this.endCheckOne = false; //Has the player been forcibly moved from stage left to center?
		this.checkOneVar = 60;
		this.endCheckTwo = false; //Has the darkness faded away?
		this.checkTwoVar = 1;
		this.endCheckThree = false; //Has the player had a bit to look around?
		this.checkThreeVar = 0;
		this.endCheckFour = false; //Have we faded to white? 
		this.checkFourVar = 0;
		this.endCheckFive = false;
		this.checkFiveVar = 0;

		makePlayer();

		//INITIALIZING DARKNESS STUFF
		dots = game.add.group();
		for(var y = 0; y < game.height / dotWidth; y ++) {
        	for(var x = 0; x < game.width / dotWidth; x ++) {
        		darkArray[x][y] = dots.create(x*dotWidth, y*dotWidth, 'dot');
        	}
		}

		this.white = game.add.image(0, 0, 'white');
		this.white.alpha = 0;
	},

	update: function() {
		playerMovement();

		//STEP 1: FORCE THE PLAYER RIGHT
		if(this.endCheckOne == false && this.endCheckTwo == false && this.endCheckThree == false && this.endCheckFour == false){
			if(this.checkOneVar < game.width / 2){
				player.position.x = this.checkOneVar;
				player.position.y = game.height / 2;
				this.checkOneVar++;
			}
			else {
				this.endCheckOne = true;
			}
		}

		//If the darkness hasn't completely faded out yet, make sure it stays
		if(this.endCheckTwo == false) {
			echoDark();
		}

		//STEP 2: FADE OUT THE DARKNESS ON THE WHOLE STAGE
		if(this.endCheckOne == true && this.endCheckTwo == false && this.endCheckThree == false && this.endCheckFour == false){
			if(this.checkTwoVar > 0){
				for(var y = 0; y < game.height / dotWidth; y ++) {
        			for(var x = 0; x < game.width / dotWidth; x ++) {
        				darkArray[x][y].alpha = this.checkTwoVar;
        			}
				}
				this.checkTwoVar = this.checkTwoVar - 0.005;
			}
			else {
				for(var y = 0; y < game.height / dotWidth; y ++) {
        			for(var x = 0; x < game.width / dotWidth; x ++) {
        				darkArray[x][y].alpha = 0;
        			}
				}
				this.endCheckTwo = true;
			}
		}
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);

		//STEP 3: WAIT A LIL BIT
		if(this.endCheckOne == true && this.endCheckTwo == true && this.endCheckThree == false && this.endCheckFour == false){
			if(this.checkThreeVar < 100) {
				this.checkThreeVar++; //just,,,,,, do nuthin' b
			}
			else {
				this.endCheckThree = true;
			}
		}

		//STEP 4: DON'T GO INTO THE LIIIIIIGHT
		if(this.endCheckOne == true && this.endCheckTwo == true && this.endCheckThree == true && this.endCheckFour == false){
			if(this.checkFourVar < 1){
				this.white.alpha = this.checkFourVar;
				this.checkFourVar = this.checkFourVar + 0.005;
			}
			else {
				this.endCheckFour = true;
			}
		}

		//STEP 5: lmao ur in the light
		if(this.endCheckOne == true && this.endCheckTwo == true && this.endCheckThree == true && this.endCheckFour == true){
			if(this.checkFiveVar < 100) {
				this.checkFiveVar++;//just,,,,, do nuthin' again b
			}
			else {
				this.endCheckFive = true;
			}
		}

		//STEP 6: GO BACK TO MAIN MENU
		if(this.endCheckFive) {
			game.state.start('MainMenu');
		}
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

//update player
function playerMovement() {
 //Reset the players velocity (movement)
 	player.events.onAnimationComplete.add(function(){ player.animations.play('float') }, this);

	player.body.velocity.x = 0;
	player.body.velocity.y = 0;
	if(game.input.keyboard.isDown(Phaser.Keyboard.W) || keys.up.isDown) // Move Up
	{
		player.body.velocity.y = -150;
		movement = true;
	}
	if (game.input.keyboard.isDown(Phaser.Keyboard.A) || keys.left.isDown) // Move to the left
	{
	    player.body.velocity.x = -150;
	    player.scale.x = 0.25;
	    player.play('side');
	    movement = true;
	}
	if(game.input.keyboard.isDown(Phaser.Keyboard.S) || keys.down.isDown) // Move Down
	{
		player.body.velocity.y = 150;
		movement = true;
	}
	if (game.input.keyboard.isDown(Phaser.Keyboard.D) || keys.right.isDown) // Move to the right
	{
	    player.body.velocity.x = 150;
	    player.scale.x = -0.25;
	    player.play('side');
	    movement = true;
	}

	if(game.input.keyboard.justPressed(Phaser.Keyboard.E)) {
		player.animations.play('grab');
	}

	if(game.input.keyboard.justPressed(Phaser.Keyboard.Q)) {
		player.animations.play('echo');
	}
}
//create player
function makePlayer() {
		player = game.add.sprite(60, game.world.height/2, 'bean', 'bean-float-00'); // The player and its settings
	    game.physics.arcade.enable(player); // We need to enable physics on the player
	    player.body.collideWorldBounds = true;
	    player.scale.setTo(0.25, 0.25);
	    player.anchor.setTo(0.5, 0.5);
	    player.animations.add('float', Phaser.Animation.generateFrameNames('bean-float-', 0, 14, '', 2));
	    player.animations.add('side', Phaser.Animation.generateFrameNames('bean-side-', 0, 15, '', 2));
	    player.animations.add('grab', Phaser.Animation.generateFrameNames('touch-', 0, 30, '', 2), 30);
	    player.animations.add('echo', Phaser.Animation.generateFrameNames('echo-', 0, 12, '', 2), 30);
	    player.animations.play('float');
	    keys = game.input.keyboard.createCursorKeys(); //enabling flash game movement
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
//echolocation around player
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
		echoRadder += 0.5;
		echoRad += 0.5;
    	if(echoX - (echoRad*dotWidth) < 0 && echoX + (echoRad*dotWidth) > game.width && echoY - (echoRad*dotWidth) < 0 && echoY + (echoRad*dotWidth) > game.height) {
    		echoOn = false;
    	}
    }
}

//Adds all of the game states to the game so that we can switch between them. 
game.state.add('Booting', Booting);
game.state.add('Preloading', Preloading);
game.state.add('MainMenu', MainMenu);
game.state.add('Stage1', Stage1);
game.state.add('Stage2', Stage2);
game.state.add('Stage3', Stage3);
game.state.add('Stage4', Stage4);
game.state.add('Stage5', Stage5);
game.state.add('Stage6', Stage6);
game.state.add('Stage7', Stage7);
game.state.add('Stage8', Stage8);
game.state.add('Stage9', Stage9);
game.state.add('StageEnd', StageEnd);
//Actually starts the game in our Main Menu state!
game.state.start('Booting');
