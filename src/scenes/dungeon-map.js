class DungeonMap extends Phaser.Scene {
	constructor() {
		super("dungeon-map_scene");
	}

	init(data) {
		this.currMap = data.mapKey || "map1";
		this.spawnName = data.spawnName || "spawn_r1";
		this.fromRoom = data.fromRoom || null;
		this.triggerLocked = false;
		this.playerFacing = "down";
		this.resumePlayerState = data.playerState || null;
		this.enemyStates = data.enemyStates || {};
		this.defeatedEnemies = data.defeatedEnemies || [];
		this.purchasedMicrotransactions = data.purchasedMicrotransactions || [];
		this.levelCompleteShown = false;
	}

	create() {
		this.createMap();
		this.createPlayer();
		this.createCamera();
		this.createControls();
		this.createAnimations();
		this.createInteractions();
		this.createLevelCompleteOverlay();
	}

	createMap() {
		this.map = this.make.tilemap({ key: this.currMap });

		this.cameras.main.setSize(560.0, 460.0);
		this.cameras.main.setPosition(33.0, 45.0);

		this.tilesets = [
			this.map.addTilesetImage("atlas_walls_high-16x32", "dungeon_walls_tiles"),
			this.map.addTilesetImage("roguelike background", "roguelike_background_tiles"),
		].filter(Boolean);

		this.backgroundLayer = this.map.createLayer("Background", this.tilesets, 0, 0);
		this.floorLayer = this.map.createLayer("Tile Layer 1", this.tilesets, 0, 0);
		this.wallLayer = this.map.createLayer("Walls", this.tilesets, 0, 0);

		if (this.wallLayer) {
			const wallTileIndices = [...new Set(
				this.wallLayer.layer.data
					.flat()
					.filter((tile) => tile && tile.index > 0)
					.map((tile) => tile.index)
			)];

			this.wallLayer.setCollision(wallTileIndices, true);
			this.wallLayer.calculateFacesWithin(0, 0, this.map.width, this.map.height);
			this.wallLayer.setDepth(11);
		}

		if (this.backgroundLayer) {
			this.backgroundLayer.setDepth(0);
		}

		if (this.floorLayer) {
			this.floorLayer.setDepth(1);
		}

		this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

		this.cameras.main.setBackgroundColor(0x2b2b2b);
	}
	
	createPlayer() {
		const spawn = this.resumePlayerState || this.findSpawnPoint(this.spawnName);
		this.playerFacing = spawn.facing || "down";

		this.player = this.physics.add.sprite(
			spawn.x,
			spawn.y,
			"player_spritesheet",
			this.getIdleFrame()
		);

		this.player.setCollideWorldBounds(true);
		this.player.setDepth(12);
		this.player.setVisible(true);
		this.player.setAlpha(1);

		this.player.body.setSize(10, 12);
		this.player.body.setOffset(3, 4);

		if (this.wallLayer) {
			this.physics.add.collider(this.player, this.wallLayer);
		}
	}

	createCamera() {
		this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
		this.cameras.main.startFollow(this.player, true);
		this.cameras.main.setZoom(2);
	}

	createControls() {
		KEY_UP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		KEY_DOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		KEY_LEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		KEY_RIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		KEY_MENU = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

		this.cursors = this.input.keyboard.createCursorKeys();
	}

	createAnimations() {
		if (this.anims.exists("walk-down")) return;

		this.anims.create({
			key: "walk-down",
			frames: this.anims.generateFrameNumbers("player_spritesheet", { start: 8, end: 11 }),
			frameRate: 8,
			repeat: -1
		});

		this.anims.create({
			key: "walk-left",
			frames: this.anims.generateFrameNumbers("player_spritesheet", { start: 8, end: 11 }),
			frameRate: 8,
			repeat: -1
		});

		this.anims.create({
			key: "walk-right",
			frames: this.anims.generateFrameNumbers("player_spritesheet", { start: 8, end: 11 }),
			frameRate: 8,
			repeat: -1
		});

		this.anims.create({
			key: "walk-up",
			frames: this.anims.generateFrameNumbers("player_spritesheet", { start: 12, end: 15 }),
			frameRate: 8,
			repeat: -1
		});
	}

	createInteractions() {
		this.createEnemyInteractions();
		this.createMicrotransactionInteractions();
		this.createLevelCompleteInteractions();
	}

	createEnemyInteractions() {
		const layer = this.map.getObjectLayer("Enemy");
		if (!layer) {
			return;
		}

		this.enemies = this.physics.add.group({
			collideWorldBounds: true,
			bounceX: 1,
			bounceY: 1,
		});
		this.enemyList = [];
		const defeatedEnemySet = new Set(this.defeatedEnemies);

		layer.objects.forEach((obj, index) => {
			const enemyId = obj.name || `enemy_${index + 1}`;
			if (defeatedEnemySet.has(enemyId)) {
				return;
			}

			const savedState = this.enemyStates[enemyId];
			const enemy = this.enemies.create(
				savedState?.x ?? obj.x + (obj.width || this.map.tileWidth) / 2,
				savedState?.y ?? obj.y - (obj.height || this.map.tileHeight) / 2,
				"pumpkin_dude_idle"
			);

			enemy.setOrigin(0.5, 0.5);
			enemy.setDepth(9);
			enemy.name = enemyId;
			enemy.triggerType = "enemy";
			enemy.baseX = obj.x + (obj.width || this.map.tileWidth) / 2;
			enemy.baseY = obj.y - (obj.height || this.map.tileHeight) / 2;
			enemy.patrolRadius = 28;
			enemy.moveSpeed = 28;
			enemy.directionTimer = 0;
			enemy.triggered = false;
			enemy.body.setAllowGravity(false);
			enemy.body.setSize(10, 12);
			enemy.body.setOffset(3, 4);
			enemy.setVelocity(savedState?.vx ?? 0, savedState?.vy ?? 0);

			enemy.triggerData = {
				enemyId,
				roomId: "r2",
				returnSpawn: this.spawnName,
			};

			this.enemyList.push(enemy);
		});

		if (this.wallLayer) {
			this.physics.add.collider(this.enemies, this.wallLayer);
		}

		this.physics.add.overlap(this.player, this.enemies, this.handleTrigger, null, this);
	}

	createMicrotransactionInteractions() {
		const layer = this.map.getObjectLayer("Microtransactions");
		if (!layer) {
			return;
		}

		this.triggerZones = this.physics.add.staticGroup();
		const purchasedSet = new Set(this.purchasedMicrotransactions);

		layer.objects.forEach((obj) => {
			const props = this.propertiesArrayToObject(obj.properties || []);
			const zoneName = obj.name || props.name || "";
			if (purchasedSet.has(zoneName)) {
				return;
			}

			const zone = this.add.zone(
				obj.x + obj.width / 2,
				obj.y + obj.height / 2,
				obj.width,
				obj.height
			);

			this.physics.add.existing(zone, true);
			zone.name = zoneName;
			zone.triggerType = "microtrans";
			zone.triggerData = {
				...props,
				returnSpawn: this.spawnName,
			};

			this.triggerZones.add(zone);
		});

		this.physics.add.overlap(this.player, this.triggerZones, this.handleTrigger, null, this);
	}

	createLevelCompleteInteractions() {
		const layer = this.map.getObjectLayer("LevelComplete");
		if (!layer) {
			return;
		}

		this.levelCompleteZones = this.physics.add.staticGroup();

		layer.objects.forEach((obj, index) => {
			const zone = this.add.zone(
				obj.x + obj.width / 2,
				obj.y + obj.height / 2,
				obj.width,
				obj.height
			);

			this.physics.add.existing(zone, true);
			zone.name = obj.name || `level_complete_${index + 1}`;
			zone.triggerType = "levelcomplete";
			this.levelCompleteZones.add(zone);
		});

		this.physics.add.overlap(this.player, this.levelCompleteZones, this.handleTrigger, null, this);
	}

	createLevelCompleteOverlay() {
		this.levelCompleteBackdrop = this.add.rectangle(280, 230, 560, 460, 0x111111, 0.55)
			.setScrollFactor(0)
			.setDepth(20)
			.setVisible(false);

		this.levelCompleteTitle = this.add.text(280, 190, "Level Complete", {
			fontFamily: "Arial",
			fontSize: "28px",
			color: "#ffffff",
			align: "center",
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(21)
			.setVisible(false);

		this.levelCompleteButton = this.add.text(280, 245, "Main Menu", {
			fontFamily: "Arial",
			fontSize: "16px",
			color: "#ffffff",
			backgroundColor: "#111111",
			padding: { left: 10, right: 10, top: 6, bottom: 6 },
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(21)
			.setVisible(false)
			.setInteractive({ useHandCursor: true })
			.on("pointerdown", () => {
				this.scene.start("game-window_scene", {
					mapKey: this.currMap,
				});
			})
			.on("pointerover", () => {
				this.levelCompleteButton.setStyle({ backgroundColor: "#f39c12" });
			})
			.on("pointerout", () => {
				this.levelCompleteButton.setStyle({ backgroundColor: "#111111" });
			});
	}

	showLevelCompleteOverlay() {
		if (this.levelCompleteShown) {
			return;
		}

		this.levelCompleteShown = true;
		this.triggerLocked = true;
		this.player.setVelocity(0, 0);
		this.player.anims.stop();
		this.player.setFrame(this.getIdleFrame());
		this.player.setDepth(22);

		const enemies = this.enemyList || [];
		enemies.forEach((enemy) => {
			enemy.setVelocity(0, 0);
			enemy.triggered = true;
		});

		this.levelCompleteBackdrop.setVisible(true);
		this.levelCompleteTitle.setVisible(true);
		this.levelCompleteButton.setVisible(true);
	}

	findSpawnPoint(spawnName) {
		const legacyLayer = this.map.getObjectLayer("Spawns");
		if (legacyLayer) {
			const legacySpawn = legacyLayer.objects.find((obj) => obj.name === spawnName);
			if (legacySpawn) {
				return { x: legacySpawn.x, y: legacySpawn.y, facing: "down" };
			}
		}

		const layer = this.map.getObjectLayer("Playerspawn");
		if (!layer || layer.objects.length === 0) {
			return { x: 32, y: 32, facing: "down" };
		}

		const spawn = layer.objects[0];
		const props = this.propertiesArrayToObject(spawn.properties || []);

		return {
			x: spawn.x + (spawn.width || this.map.tileWidth) / 2,
			y: spawn.y - (spawn.height || this.map.tileHeight) / 2,
			facing: props.facing || "down",
		};
	}

	getIdleFrame() {
		switch (this.playerFacing) {
			case "up":
				return 12;
			case "left":
			case "right":
				return 8;
			default:
				return 8;
		}
	}

	propertiesArrayToObject(propsArray) {
		let obj = {};

		propsArray.forEach((prop) => {
			obj[prop.name] = prop.value;
		});

		return obj;
	}

	getPlayerState() {
		return {
			x: this.player.x,
			y: this.player.y,
			facing: this.playerFacing,
		};
	}

	getEnemyStates() {
		const enemyStates = {};
		const enemies = this.enemyList || [];

		enemies.forEach((enemy) => {
			if (!enemy.active) {
				return;
			}

			enemyStates[enemy.name] = {
				x: enemy.x,
				y: enemy.y,
				vx: enemy.body?.velocity.x || 0,
				vy: enemy.body?.velocity.y || 0,
			};
		});

		return enemyStates;
	}

	updateEnemies() {
		const enemies = this.enemyList || [];

		enemies.forEach((enemy) => {
			if (!enemy.active || enemy.triggered) {
				return;
			}

			enemy.directionTimer -= this.game.loop.delta;
			const distanceFromBase = Phaser.Math.Distance.Between(
				enemy.x,
				enemy.y,
				enemy.baseX,
				enemy.baseY
			);

			if (distanceFromBase > enemy.patrolRadius) {
				this.physics.moveTo(enemy, enemy.baseX, enemy.baseY, enemy.moveSpeed);
				enemy.directionTimer = Phaser.Math.Between(600, 1200);
				return;
			}

			if (enemy.directionTimer <= 0 || (enemy.body.velocity.x === 0 && enemy.body.velocity.y === 0)) {
				const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
				const speed = Phaser.Math.Between(12, enemy.moveSpeed);

				enemy.setVelocity(
					Math.cos(angle) * speed,
					Math.sin(angle) * speed
				);
				enemy.directionTimer = Phaser.Math.Between(900, 1800);
			}
		});
	}

	handleTrigger(player, zone) {
		if (this.triggerLocked) return;
		this.triggerLocked = true;

		this.time.delayedCall(250, () => {
			this.triggerLocked = false;
		});

		const data = zone.triggerData || {};

		if (zone.triggerType === "enemy") {
			zone.triggered = true;
			zone.setVelocity(0, 0);

			this.scene.start("game-window_scene", {
				mapKey: this.currMap,
				roomId: data.roomId || "r2",
				enemyId: data.enemyId || zone.name,
				returnSpawn: data.returnSpawn || this.spawnName,
				playerState: this.getPlayerState(),
				enemyStates: this.getEnemyStates(),
				defeatedEnemies: this.defeatedEnemies,
				purchasedMicrotransactions: this.purchasedMicrotransactions,
				fromMap: true,
				triggerName: zone.name,
				triggerType: zone.triggerType,
			});
		}
		else if (zone.triggerType === "microtrans") {
			this.scene.start("game-window_scene", {
				mapKey: this.currMap,
				returnSpawn: data.returnSpawn || this.spawnName,
				playerState: this.getPlayerState(),
				enemyStates: this.getEnemyStates(),
				defeatedEnemies: this.defeatedEnemies,
				purchasedMicrotransactions: this.purchasedMicrotransactions,
				fromMap: true,
				triggerName: zone.name,
				triggerType: zone.triggerType
			});
		}
		else if (zone.triggerType === "levelcomplete") {
			this.showLevelCompleteOverlay();
		}
	}

	update() {
		const speed = 80;
		let vx = 0;
		let vy = 0;

		this.updateEnemies();
		this.player.setDepth(this.levelCompleteShown ? 22 : 12);
		this.player.setVisible(true);
		this.player.setAlpha(1);

		if (this.levelCompleteShown) {
			this.player.setVelocity(0, 0);
			return;
		}

		if (KEY_LEFT.isDown || this.cursors.left.isDown) {
			vx = -speed;
		}
		else if (KEY_RIGHT.isDown || this.cursors.right.isDown) {
			vx = speed;
		}

		if (KEY_UP.isDown || this.cursors.up.isDown) {
			vy = -speed;
		}
		else if (KEY_DOWN.isDown || this.cursors.down.isDown) {
			vy = speed;
		}

		this.player.setVelocity(vx, vy);

		this.player.body.velocity.normalize().scale(speed);

		if (vx < 0) {
			this.playerFacing = "left";
			this.player.setFlipX(true);
			this.player.anims.play("walk-left", true);
		}
		else if (vx > 0) {
			this.playerFacing = "right";
			this.player.setFlipX(false);
			this.player.anims.play("walk-right", true);
		}
		else if (vy < 0) {
			this.playerFacing = "up";
			this.player.setFlipX(false);
			this.player.anims.play("walk-up", true);
		}
		else if (vy > 0) {
			this.playerFacing = "down";
			this.player.setFlipX(false);
			this.player.anims.play("walk-down", true);
		}
		else {
			this.player.anims.stop();
			this.player.setFlipX(this.playerFacing === "left");
			this.player.setFrame(this.getIdleFrame());
		}
	}
}
