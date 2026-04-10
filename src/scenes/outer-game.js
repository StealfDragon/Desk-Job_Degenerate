class OuterGame extends Phaser.Scene {
	constructor() {
		super("outer-game_scene");
	}
	preload() {
	this.load.image('outertv', 'assets/images/outergametv.png');
    
	}

	create() {
		this.scene.launch("inner-game_scene")
	}
}

