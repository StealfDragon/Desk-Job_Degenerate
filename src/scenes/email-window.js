class EmailWindow extends Phaser.Scene {
	constructor() {
		super("email-window_scene");
	}

	create() {
		this.cameras.main.setBackgroundColor(0x00ff00);
		this.cameras.main.setSize(300.0, 200.0);
		this.cameras.main.setPosition(170.0, 260.0);

		this.emails = [
			new Email(this),
		];

		for(let email of this.emails) {
			email.on("sort-correct", () => {
				this.events.emit("sort-correct");
			});

			email.on("sort-incorrect", () => {
				this.events.emit("sort-incorrect");
			});
		}
	}
}

