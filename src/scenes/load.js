class Load extends Phaser.Scene {
	constructor() {
		super("load_scene");
	}

	preload() {
		this.load.image("button_delete", "assets/ui/button_delete.png");
		this.load.image("button_respond", "assets/ui/button_respond.png");
	}
}

