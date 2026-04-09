class Desktop extends Phaser.Scene {
	constructor() {
		super("desktop_scene")
	}

	create() {
		this.scene.launch("email-window_scene");
	}
}

