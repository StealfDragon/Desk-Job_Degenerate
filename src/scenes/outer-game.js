class OuterGame extends Phaser.Scene {
	constructor() {
		super("outer-game_scene");
	}

<<<<<<< Updated upstream
	preload() {
	this.load.image('outertv', 'assets/images/outergametv.png');
    
	  }

	create() {}
=======
	create() {
		this.scene.launch("inner-game_scene")
	}
>>>>>>> Stashed changes
}

