//Development Branch
var game = new Phaser.Game(800, 600, Phaser.AUTO); // Creates a 800 x 600 screen in which the game is displayed
var ledge, platforms, torches, player, door, doorCheck, match, flick;
var fwoosh, unlock, echoSound, echoFill, lookBack;
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
		game.load.spritesheet('door', 'assets/img/door.png', 32, 32); // Preload door
	
		game.load.audio('fwoosh', 'assets/audio/Fwoosh.mp3');
		game.load.audio('unlock', 'assets/audio/Unlock.mp3');
		game.load.audio('echoSound', 'assets/audio/echoSound.mp3');
		game.load.audio('lookBack', 'assets/audio/lookBack.mp3');
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
		
		//MAKING THE WORLDBOUNDS THAT WE CANNOT ESCAPE FROM BECAUSE WE ARE DOOMED IN THIS LIFE
	    platforms = game.add.group(); // The platforms group contains the ground and the 2 ledges we can jump on
	    platforms.enableBody = true; // We will enable physics for any object that is created in this group
		
	    ledge = platforms.create(0, 450, 'ground'); // Here we create the ground.
	    ledge.scale.setTo(1, 3); // Scale it to fit the width of the game (the original sprite is 400x32 in size)
	    ledge.body.immovable = true; // This stops it from falling away when you jump on it
	    ledge = platforms.create(0, 380, 'ground'); // Bottom left of the area border
		ledge.scale.setTo(0.25, 2);
	    ledge.body.immovable = true;
	    ledge = platforms.create(600, 380, 'ground'); // Bottom right of the area border
		ledge.scale.setTo(0.25, 2);
	    ledge.body.immovable = true;
		
		ledge = platforms.create(0, 0, 'ground'); // Top center of the area border
		ledge.scale.setTo(1, 3);
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
		player = game.add.sprite(50, game.world.height/2, 'bean', 'bean-float-00'); // The player and its settings
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
				flick.animations.play('alight', 10, true);
				flick.position.y = flick.position.y - 19; //resetting sprite height
			}
	    }

		//WIN CONDITIONS
		if(checkOverlap(player, door) && door.frame == 1) 
		{
			game.state.start('Stage2');
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
		game.load.atlas('bean', 'assets/img/bean.png', 'assets/img/bean.json');
		game.load.image('dot', 'assets/img/dot.png');
		game.load.image('star', 'assets/img/star.png'); //Powerup that gives you 1 more echolocation. 
		//in case you start in stage 2

		game.load.atlas('atlas', 'assets/img/assets.png', 'assets/img/assets.json');

		game.load.image('sky', 'assets/img/sky.png'); // Preload background
	    game.load.image('ground', 'assets/img/platform.png'); // Preload platform
	    game.load.image('wall', 'assets/img/wall.png');
		game.load.spritesheet('door', 'assets/img/door.png', 32, 32); // Preload door
	
		game.load.audio('unlock', 'assets/audio/Unlock.mp3');
		game.load.audio('echoSound', 'assets/audio/echoSound.mp3');
		game.load.audio('echoFill', 'assets/audio/echoFill.mp3');
		game.load.audio('fwoosh', 'assets/audio/Fwoosh.mp3');
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
		
		weight =  game.add.sprite(550, game.world.height - 150, 'diamond'); // Add weight
		game.physics.arcade.enable(weight); // Apply physics on weight?
	    weight.body.collideWorldBounds = true;
		weight.body.bounce.set(0.8);
		weight.body.drag.x = 100;
		weight.body.drag.y = 100;
		
		player = game.add.sprite(50, game.world.height/2, 'bean', 'bean-float-00'); // The player and its settings

		makePlayer();

		//INTERACT PROMPT WITH WEIGHT
		interact = game.add.sprite(550, game.world.height - 200, 'atlas', 'e'); // Add interacting key prompt
		interact.scale.setTo(0.5, 0.5);

		echoAmount = 1; //Amount of times player can echolocate
		star = game.add.sprite(game.world.width/2 + 50, game.world.height/2 - 125, 'star'); //adds in powerup in this location

		QText = game.add.sprite(player.position.x + 20, player.position.y - 20, 'atlas', 'q');
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
* We'll leave this up to Nithin to build, since he created it.  
*/
var Stage3 = function(game) {};
Stage3.prototype = {
	
	preload: function() {
		//Note: once preloaded in one state, a sprite does not need to be preloaded in any other states. 
		console.log("Stage3: Preload");
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
		console.log('Stage3: Create');
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
		ledge = platforms.create(445, game.world.height/2 - 100, 'wall'); // gate 2 bottom
		ledge.body.immovable = true;

		//IN THIS INSTANCE, THE PLACE YOU NEED TO BRING THE DIAMOND
		flick = game.add.sprite(game.world.width/2 + 14, game.world.height/2 + 200, 'second');
		//game.world.width/2, game.world.height/2 + 100
		//DOOR YOU CAN USE TO LEAVE
		door = game.add.sprite(game.world.width - 60, 140, 'door') // Add door
		door.scale.setTo(2, 2);
		door.anchor.setTo(0.5, 0.5);
		door.frame = 0; // Closed door frame
		doorCheck = false; //IN THIS STAGE, haven't picked up the weight yet
		
		weight =  game.add.sprite(game.world.width/2 + 14, 128, 'diamond'); // Add weight
		game.physics.arcade.enable(weight); // Apply physics on weight?
	    weight.body.collideWorldBounds = true;
		weight.body.bounce.set(0.8);
		weight.body.drag.x = 100;
		weight.body.drag.y = 100;
		
		makePlayer();
		player.position.y = 150;

		//INTERACT PROMPT WITH WEIGHT
		interact = game.add.sprite(550, game.world.height - 200, 'interact'); // Add interacting key prompt

		echoAmount = 1; //Amount of times player can echolocate
		star = game.add.sprite(200, 115, 'star'); //adds in powerup in this location
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
			game.state.start('Stage4');
		}


		//DARKNESS STUFF
		echoDark(); //enabling echolocation ability
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);
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
		ledge = platforms.create(0, 200, 'ground'); // right horizontal wall
		ledge.scale.setTo(.75, 13);
	    ledge.body.immovable = true;
		ledge = platforms.create(0, 32, 'ground'); // left horizontal wall
		ledge.scale.setTo(.4, 6);
	    ledge.body.immovable = true;
		ledge = platforms.create(game.world.width - 300, 32, 'ground'); // horizontal
		ledge.scale.setTo(.75, 13);
	    ledge.body.immovable = true;
		ledge = platforms.create(775, 0, 'wall'); // Right Wall
		ledge.body.immovable = true;
		ledge = platforms.create(-25, 0, 'wall'); // Left wall
		ledge.body.immovable = true;

		//IN THIS INSTANCE, THE PLACE YOU NEED TO BRING THE DIAMOND
		flick = game.add.sprite(game.world.width/2 + 100, game.world.height/2 + 200, 'second');
		//game.world.width/2, game.world.height/2 + 100
		//DOOR YOU CAN USE TO LEAVE
		door = game.add.sprite(game.world.width - 60, game.world.height/2 + 210, 'door') // Add door
		door.scale.setTo(2, 2);
		door.anchor.setTo(0.5, 0.5);
		door.frame = 0; // Closed door frame
		doorCheck = false; //IN THIS STAGE, haven't picked up the weight yet
		
		weight =  game.add.sprite(400, 128, 'diamond'); // Add weight
		game.physics.arcade.enable(weight); // Apply physics on weight?
	    weight.body.collideWorldBounds = true;
		weight.body.bounce.set(0.8);
		weight.body.drag.x = 100;
		weight.body.drag.y = 100;

		makePlayer();

		//INTERACT PROMPT WITH WEIGHT
		interact = game.add.sprite(550, game.world.height - 200, 'interact'); // Add interacting key prompt

		echoAmount = 1; //Amount of times player can echolocate
		star = game.add.sprite(300, 115, 'star'); //adds in powerup in this location
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
			game.state.start('Stage4');
		}


		//DARKNESS STUFF
		echoDark(); //enabling echolocation ability
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);
	},

	render: function() {

	}
}

/*STAGE 4!!
* Player has to light a match on fire and throw it into the wood pile across the gap.
*/
var Stage4 = function(game) {};
Stage4.prototype = {
	
	preload: function() {
		console.log("Stage4: Preload");
		game.load.atlas('bean', 'assets/img/bean.png', 'assets/img/bean.json');
		game.load.atlas('atlas', 'assets/img/assets.png', 'assets/img/assets.json');
		game.load.image('dot', 'assets/img/dot.png');

		game.load.image('wall', 'assets/img/wall.png');
		game.load.spritesheet('door', 'assets/img/door.png', 32, 32); // Preload door

		game.load.audio('unlock', 'assets/audio/Unlock.mp3');
		game.load.audio('echoSound', 'assets/audio/echoSound.mp3');
		game.load.audio('echoFill', 'assets/audio/echoFill.mp3');
		game.load.audio('fwoosh', 'assets/audio/Fwoosh.mp3');
	},
	
	create: function() {
		console.log("Stage4: Create");
		fwoosh = game.add.audio('fwoosh');
		unlock = game.add.audio('unlock');
		echoSound = game.add.audio('echoSound');
		echoFill = game.add.audio('echoFill');
		game.stage.backgroundColor = "#facade";
		doorCheck = false; //is the torch on fire?

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
		dispenser = game.add.sprite(100, 500, 'atlas', 'gascan');

		makePlayer();

		//e prompts
		interactDispenser = game.add.sprite(dispenser.position.x + 50, dispenser.position.y - 50, 'atlas', 'e'); // Add interacting key prompt
		interactDispenser.scale.setTo(0.5, 0.5);
		interact = game.add.sprite(800, 600, 'atlas', 'e'); //over the match
		interact.scale.setTo(0.5, 0.5);

		match = new Throwable(game, 1000, 1000, 'atlas', 'torch', player);
		game.add.existing(match);
		match.scale.setTo(0.25, 0.25);
		match.animations.add('alight', Phaser.Animation.generateFrameNames('fire-torch-', 0, 5, '', 2));
		match.animations.add('off', ['torch']); //animation of a single sprite. It's off, b. 

		//INITIALIZING DARKNESS STUFF
		dots = game.add.group();
		for(var y = 0; y < game.height / dotWidth; y ++) {
        	for(var x = 0; x < game.width / dotWidth; x ++) {
        		darkArray[x][y] = dots.create(x*dotWidth, y*dotWidth, 'dot');
        	}
		}
	},

	update: function() {
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
			game.state.start('MainMenu');
		}
		
		//DARKNESS STUFF
		echoDark(); //enabling echolocation ability
		//erase around the player character
		erase(darkArray, player.position.x, player.position.y, 7, -1);
		erase(darkArray, door.position.x, door.position.y, 10, -1);
		erase(darkArray, 670, 360, 10, -1); //flick bottom
		erase(darkArray, 670, 230, 10, -1); //flick top
		if(doorCheck) {
			erase(darkArray, match.position.x + 5, match.position.y + 10, 2, -1);
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
game.state.add('Stage3', Stage3);
game.state.add('Stage4', Stage4);
//Actually starts the game in our Main Menu state!
game.state.start('Stage4');
