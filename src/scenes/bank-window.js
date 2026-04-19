class BankWindow extends Phaser.Scene {
    constructor() {
        super("bank-window_scene");
    }

    create(starting_balance) {
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
        this.cameras.main.setSize(160.0, 120.0);
        this.cameras.main.setPosition(750.0, 27.0);

        this.add.rectangle(80.0, 60.0, 160.0, 120.0, 0xf5c842);

        this.add.rectangle(80.0, 12.0, 160.0, 24.0, 0xe0b030);

        this.add.text(8.0, 4.0, "+", { fontFamily: 'Arial', fontSize: '14px', color: '#ffffff' });
        this.add.text(118.0, 4.0, "...", { fontFamily: 'Arial', fontSize: '14px', color: '#ffffff' });
        this.add.text(140.0, 4.0, "✕", { fontFamily: 'Arial', fontSize: '14px', color: '#ffffff' });

        this.balance_text = this.add.text(10.0, 35.0, "", {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#333333',
        });

        this.balance_text_update(starting_balance);
    }

    balance_text_update(new_balance) {
        this.balance_text.setText(`Balance:\n$${new_balance}`);
    }
}