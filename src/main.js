/* CMPM 170 - sprint 1
 * team:
 *		noah flournoy
 *		cassian jones
 *		josh gioffre
 *		hannah gong
 *		yuval szwarcbord
 *		amory acosta
 */

let config = {
	type: Phaser.WEBGL,

	width: 640,
	height: 480,

	scene: [ Load, Desktop, BankWindow, EmailWindow, GameWindow, ],
};

let game = new Phaser.Game(config);

