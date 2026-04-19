class BankWindow extends Phaser.Scene {
    constructor() {
        super("bank-window_scene");
    }

create(starting_balance) {
	    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
	    this.cameras.main.setSize(200.0, 30.0);
	    this.cameras.main.setPosition(860.0, 30.0);

    	this.balance_text = this.add.text(5.0, 5.0, "", {
    	    fontFamily: 'Arial',
    	    fontSize: '14px',
    	    color: '#ffffff'
    	});	    

		this.balance_text_update(starting_balance);
	}
	
    balance_text_update(new_balance) {
        this.balance_text.text = `Balance: $${new_balance}`;
    }
}