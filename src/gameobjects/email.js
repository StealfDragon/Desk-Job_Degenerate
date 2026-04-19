class Email extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0.0, 24.0);
        scene.add.existing(this);

        this.subject = "Loading...";
        this.message = "Please wait.";
        this.category = null;

        this.subject_text = scene.add.text(12.0, 30.0, this.subject, {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#ffffff',
            fontStyle: 'bold',
            wordWrap: {width: 316},
        });

        this.message_text = scene.add.text(12.0, 48.0, this.message, {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#cccccc',
            wordWrap: {width: 316},
            lineSpacing: 3,
        });

        this.add([this.subject_text, this.message_text]);

        this.loadEmail();
    }

    async loadEmail() {
        const email = await tryGenerateEmail();
        const rankedEmail = await tryRankEmail(email);
        const lines = email.split("\n").filter(l => l.trim() !== "");

        this.subject = lines[0] || email;
        this.message = lines.slice(1).join("\n") || "";
        this.category = rankedEmail === "important" ? "archive" : "trash";

        this.subject_text.setText(this.subject);
        this.message_text.setText(this.message);

        this.emit("email-loaded");
    }

    submitChoice(choice) {
        const correct =
            (choice === "important" && this.category === "archive") ||
            (choice === "not important" && this.category === "trash");

        this.emit(correct ? "sort-correct" : "sort-incorrect");
    }
}