class OuterGame extends Phaser.Scene {
	constructor() {
		super("outer-game_scene");
	}

	create() {
		this.button_delete = this.add.image(
			0, 0, "button_delete"
		).setInteractive().on("pointerdown", () => {
			this.email_delete();
		});

		this.button_respond = this.add.image(
			100, 0, "button_respond"
		).setInteractive().on("pointerdown", () => {
			this.email_respond();
		});
	}

	email_delete() {
		console.log("deleted email!");
	}

	email_respond() {
		console.log("responded to email!");
	}
}

