class GameWindow extends Phaser.Scene {
	constructor() {
		super("game-window_scene");
	}

	init(data) {
		this.currMap = data.mapKey || "map1";
		this.currRoom = data.roomId || "r1";
		this.returnSpawn = data.returnSpawn || "spawn_r1";
		this.enemyId = data.enemyId || null;
		this.playerState = data.playerState || null;
		this.enemyStates = data.enemyStates || {};
		this.defeatedEnemies = data.defeatedEnemies || [];
		this.purchasedMicrotransactions = data.purchasedMicrotransactions || [];

		this.fromMap = data.fromMap || false;
		this.triggerName = data.triggerName || null;
		this.triggerType = data.triggerType || null;
		this.firstRoom = true;
	}

	makeTextbox(x, y, text, func) {
		let button = this.add.text(x, y, text, this.scoreConfig)
			.setStyle({ backgroundColor: '#111' })
			.setInteractive({ useHandCursor: true })
			.on('pointerdown', () => {
				func(button);
				this.sound.play('textbox-click_sound', this.buttonAudioConfig);
			})
			.on('pointerover', () => {
				button.setStyle({ backgroundColor: '#f39c12' });
				this.sound.play('textbox-hover_sound', this.buttonAudioConfig);
			})
			.on('pointerout', () => button.setStyle({ backgroundColor: '#111' }));
		this.textOptions.push(button);
	}

	enterRoom(room) {}

	loadOptions(room) {
		let x = 100;
		let y = 140;
		if (room.type === Room.COMBAT_TYPE) {
			this.makeTextbox(x, y, "attack enemy", this.attackEnemyOption.bind(this));
			y += 25;
		}
		if (!this.firstRoom) {
			this.makeTextbox(x, y, "Go to Map", this.goToMap.bind(this));
			y += 25;
		}
		else {
			this.firstRoom = false;
			this.scene.start("dungeon-map_scene", {
				mapKey: this.currMap,
				spawnName: this.returnSpawn,
				playerState: this.playerState,
				enemyStates: this.enemyStates,
				defeatedEnemies: this.defeatedEnemies,
				purchasedMicrotransactions: this.purchasedMicrotransactions,
			});
			return;
		}

		for (let option in room.options) {
			this.makeTextbox(x, y, option.text, option.func);
			y += 25;
		}
	}

	attackEnemyOption(button) {
		button.setStyle({ backgroundColor: '#FFF' });
		if (CURRENCY_INTERFACE.account_balance < 5) {
			if (this.statusText) {
				this.statusText.setText("Not enough money to attack. Need $5.");
			}
			return;
		}

		CURRENCY_INTERFACE.money_spend(5, "attack enemy");
		this.bank_scene.balance_text_update(CURRENCY_INTERFACE.account_balance);

		const defeatedEnemies = [...this.defeatedEnemies];
		if (this.enemyId && !defeatedEnemies.includes(this.enemyId)) {
			defeatedEnemies.push(this.enemyId);
		}

		if (this.statusText) {
			this.statusText.setText(`Attacked ${this.enemyId || "enemy"} for $5.`);
		}

		this.scene.start("dungeon-map_scene", {
			mapKey: this.currMap,
			spawnName: this.returnSpawn,
			playerState: this.playerState,
			enemyStates: this.enemyStates,
			defeatedEnemies,
			purchasedMicrotransactions: this.purchasedMicrotransactions,
		});
	}

	goToMap(button) {
		button.setStyle({ backgroundColor: '#FFF' });
		this.scene.start("dungeon-map_scene", {
			mapKey: this.currMap,
			spawnName: this.returnSpawn,
			playerState: this.playerState,
			enemyStates: this.enemyStates,
			defeatedEnemies: this.defeatedEnemies,
			purchasedMicrotransactions: this.purchasedMicrotransactions,
		});
	}

	startGame(button) {
		button.visible = false;
		this.startText.visible = false;
		this.loadOptions(Room.maps.map1.rooms.r1);
	}

	create() {
		this.bank_scene = this.scene.get("bank-window_scene");
		KEY_UP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		KEY_DOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		KEY_MENU = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

		this.textOptions = [];

		this.startConfig = {
			fontFamily: 'Arial',
			fontSize: '30px',
			color: '#FFFFFF',
			align: 'left',
			padding: { top: 5, bottom: 5 },
		};

		this.scoreConfig = {
			fontFamily: 'Arial',
			fontSize: '10px',
			color: '#FFFFFF',
			align: 'left',
			padding: { top: 5, bottom: 5 },
		};

		this.buttonAudioConfig = { volume: 1, loop: false };

		this.cameras.main.setSize(560.0, 480.0);
		this.cameras.main.setPosition(33.0, 35.0);

		this.add.rectangle(310.0, 280.0, 620.0, 560.0, 0x2b2b2b).setDepth(0);

		this.add.rectangle(310.0, 12.0, 620.0, 24.0, 0x202020).setDepth(10);
		this.add.text(8.0, 4.0, "Dungeon Game 3", { fontFamily: 'Arial', fontSize: '12px', color: '#ffffff' }).setDepth(11);
		this.add.text(500.0, 4.0, "—", { fontFamily: 'Arial', fontSize: '12px', color: '#ffffff' }).setDepth(11);
		this.add.text(525.0, 3.0, "□", { fontFamily: 'Arial', fontSize: '12px', color: '#ffffff' }).setDepth(11);
		this.add.text(545.0, 4.0, "✕", { fontFamily: 'Arial', fontSize: '12px', color: '#ffffff' }).setDepth(11);

		if (this.triggerType === "microtrans") {
			this.makeTextbox(100, 175, "Buy Microtransaction", this.buyMicrotransaction.bind(this));
			this.makeTextbox(100, 200, "Return to Map", this.returnToMap.bind(this));
		} else if (this.triggerType === "enemy") {
			this.makeTextbox(100, 175, "Attack Enemy", this.attackEnemyOption.bind(this));
			this.makeTextbox(100, 200, "Return to Map", this.returnToMap.bind(this));
		}

		this.startText = this.add.text(50, 80, "Dungeon Game 3", this.startConfig);
		this.statusText = this.add.text(50, 110, "", this.scoreConfig);

		if (!this.triggerType) {
			this.makeTextbox(50, 140, "PLAY", this.startGame.bind(this));
		} else {
			this.startText.visible = false;
		}
	}

	buyMicrotransaction(button) {
		button.setStyle({ backgroundColor: '#FFF' });
		console.log("Microtransaction purchase clicked.");

		if (CURRENCY_INTERFACE.account_balance >= 5) {
			CURRENCY_INTERFACE.money_spend(5);
			this.bank_scene.balance_text_update(CURRENCY_INTERFACE.account_balance);
			const purchasedMicrotransactions = [...this.purchasedMicrotransactions];
			if (this.triggerName && !purchasedMicrotransactions.includes(this.triggerName)) {
				purchasedMicrotransactions.push(this.triggerName);
			}
			this.scene.start("dungeon-map_scene", {
				mapKey: this.currMap,
				roomId: this.currRoom,
				spawnName: this.returnSpawn,
				playerState: this.playerState,
				enemyStates: this.enemyStates,
				defeatedEnemies: this.defeatedEnemies,
				purchasedMicrotransactions,
			});
		} else if (this.statusText) {
			this.statusText.setText("Not enough money. Need $5.");
		}
	}

	returnToMap(button) {
		button.setStyle({ backgroundColor: '#FFF' });
		this.scene.start("dungeon-map_scene", {
			mapKey: this.currMap,
			spawnName: this.returnSpawn,
			playerState: this.playerState,
			enemyStates: this.enemyStates,
			defeatedEnemies: this.defeatedEnemies,
			purchasedMicrotransactions: this.purchasedMicrotransactions,
		});
	}
}
