class Load extends Phaser.Scene {
	constructor() {
		super("load_scene");
	}

	preload() {
		this.load.once("complete", () => { this.scene.start("desktop_scene"); });

		this.load.bitmapFont(
			"roboto_font",
			"./assets/fonts/roboto/roboto.png",
			"./assets/fonts/roboto/roboto.xml"
		);
	}
}

