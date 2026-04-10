class InnerGame extends Phaser.Scene {
	constructor() {
		super("inner-game_scene");
	}

<<<<<<< Updated upstream
	preload() {
    this.load.image('inventory', 'assets/images/inventory.png');
    this.load.image('pausemenu', 'assets/images/Play-Options-Exit.png)');
    this.load.image('levelborder', 'assets/images/Level Border.png');
    this.load.spritesheet('rogueplayer', 'assets/images/doc.png', { frameWidth: 16, frameHeight: 16 });
    
	  }

	create() {}
=======
	make_textbox(x, y, text) {
		let button = this.add.text(x, y, text, this.scoreConfig)
			.setStyle({ backgroundColor: '#111' })
			.setInteractive({ useHandCursor: true })
			.on('pointerdown', this.fart)
			.on('pointerover', () => button.setStyle({ backgroundColor: '#f39c12' }))
			.on('pointerout', () => button.setStyle({ backgroundColor: '#111' }));
	}

	fart() {

	}

	create() {
		KEY_UP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		KEY_DOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		KEY_MENU = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

		this.curr_map = "map1"
		this.curr_room = "r1"

		this.scoreConfig = {
			fontFamily: 'Arial',
			fontSize: '10px',
			color: '#FFFFFF',
			align: 'left',
			padding: {
				top: 5,
				bottom: 5,
			},
		}

		this.make_textbox(100,100,"hello i am under the water please help me")
		this.make_textbox(100,125,"aaaaaaaaaaaaaaa")
		this.make_textbox(100,150,"pee pee poo poo")
	}
>>>>>>> Stashed changes
}

