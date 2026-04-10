class InnerGame extends Phaser.Scene {
	constructor() {
		super("inner-game_scene");
	}

	preload() {
    this.load.image('inventory', 'assets/images/inventory.png');
    this.load.image('pausemenu', 'assets/images/Play-Options-Exit.png)');
    this.load.image('levelborder', 'assets/images/Level Border.png');
    this.load.spritesheet('rogueplayer', 'assets/images/doc.png', { frameWidth: 16, frameHeight: 16 });
    
	  }

	create() {}
}

