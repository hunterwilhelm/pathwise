import {SketchApp} from "./sketch.app";
import p5 from "p5";
import {SketchUtils} from "./sketch.utils";

export class SketchDisplayService {

    private app: SketchApp;
    private p: p5;

    constructor(p: p5, app: SketchApp) {
        this.app = app;
        this.p = p;
    }

    displayBackground() {
        // background
        if (this.app.imgBackground) {
            this.p.imageMode(this.p.CENTER);
            this.p.background(0);
            this.p.rectMode(this.p.CENTER);
            this.p.fill("#C8C9C8");
            this.p.noStroke();
            this.p.rect(this.p.width / 2, this.p.height / 2, this.app.myScale * this.app.imgBackground.width + 20 * this.app.myScale, this.app.myScale * this.app.imgBackground.height + 20 * this.app.myScale);
            this.p.image(this.app.imgBackground, this.p.width/2, this.p.height/2, this.app.myScale * this.app.imgBackground.width, this.app.myScale * this.app.imgBackground.height);
            return;
        }
    }

    displayBoard() {
        let closestIndex = SketchUtils.findClosestPointIndex(this.app.points, this.p.mouseX, this.p.mouseY);
        if (this.app.won) closestIndex = undefined;

        this.app.points.forEach((p, i) => {
            if (p.turn == null && this.app.isUsersTurn && closestIndex === i) {
                this.p.image(this.app.turns[this.app.turn].img, p.x, p.y, this.app.tileWidth*2, this.app.tileWidth*2);
                this.p.fill(this.app.turns[this.app.turn].color);
                this.p.stroke(100);
                this.p.strokeWeight(1);
                this.p.circle(p.x, p.y, 25);
                return;
            }
            if (p.border) {
                // fill(255);
                // polygon(this.app.points[p].x, this.app.points[p].y, w, 6);
                return;
            }

            this.p.imageMode(this.p.CENTER);
            if (p.turn != null) {
                this.p.image(this.app.turns[p.turn].img, p.x, p.y, this.app.tileWidth*2, this.app.tileWidth*2);
            } else {
                this.p.image(this.app.imgStar1, p.x, p.y, this.app.tileWidth*2, this.app.tileWidth*2);
            }
            // fill(0);
            // noStroke();
            // text(p, p.x, p.y);
        });
    }

    displayHUD() {

        // top rectangle
        const X = this.p.width / 2;
        const Y = 50;
        const W = 400;
        const H = 40;
        this.p.fill(255);
        this.p.rectMode(this.p.CORNER);
        this.p.stroke(0);
        this.p.strokeWeight(1);
        this.p.rect(X - W/2, Y - H / 2, W, H);
        this.p.fill(0);
        this.p.textSize(25);
        this.p.noStroke();
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        const turnName = this.app.turns[this.app.turn].name;
        const subject = this.app.isUsersTurn ? "You" : "Opponent";
        const possessive = this.app.isUsersTurn ? "r" : "'s";
        const status = this.app.won ? " won!" : `${possessive} turn`;
        this.p.text(`${turnName}: ${subject}${status}`, X, Y - 5);

        // speech bubbles
        if (!this.app.won) {
            this.p.image(this.app.turns[this.app.turn].speech, this.app.turns[this.app.turn].speechPos.x, this.app.turns[this.app.turn].speechPos.y);
            this.p.textSize(20);
            const speechText = this.app.isUsersTurn ?
                "Your turn!" :
                "Waiting...";
            this.p.text(speechText, this.app.turns[this.app.turn].speechPos.x, this.app.turns[this.app.turn].speechPos.y - 35);
        }
    }

    private displayMainScreen() {
        // background
        this.p.background(0);
        this.p.noStroke();
        this.p.fill("#C8C9C8");
        this.p.rectMode(this.p.CENTER);
        this.p.rect(this.p.width / 2, this.p.height / 2, this.app.myScale * this.app.imgBackground.width + 20 * this.app.myScale, this.app.myScale * this.app.imgBackground.height + 20 * this.app.myScale);
        this.p.fill(255);
        this.p.rect(this.p.width / 2, this.p.height / 2, this.app.myScale * this.app.imgBackground.width, this.app.myScale * this.app.imgBackground.height);

        // icons
        this.p.image(this.app.turns[1].img, this.p.width / 2 - 200, this.p.height / 2 - 270);
        this.p.image(this.app.turns[0].img, this.p.width / 2 + 200, this.p.height / 2 - 270);

        // title
        this.p.noStroke();
        this.p.fill(this.app.turns[1].color);
        this.p.textSize(56);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.text("Pathwise", this.p.width / 2, this.p.height / 2 - 275);
        this.p.imageMode(this.p.CENTER);
    }

    private displayPrimaryInstructions(message: string) {
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.textSize(35);
        this.p.fill(30);
        this.p.stroke(30);
        this.p.strokeWeight(1);
        this.p.text(message, this.p.width / 2, this.p.height / 2);

    }

    displayGameWelcomeInstructions() {
        this.displayMainScreen();
        // text
        this.displayPrimaryInstructions("On your turn, click on any tile\nto change it to your color. Your goal is\nto create a pathway that connects\nthe two sides of your color.");

        this.p.textSize(30);
        this.p.fill(this.app.turns[1].color);
        this.p.noStroke();
        this.p.text("Press anywhere to begin", this.p.width / 2, this.p.height / 2 + 200);
    }

    displayGameAwaitingRematchInstructions() {
        this.displayMainScreen();
        this.displayPrimaryInstructions("Waiting for your opponent to agree to a rematch...");
    }

    displayGameWaitingRoomInstructions() {
        this.displayMainScreen();
        this.displayPrimaryInstructions("Waiting for another user to join...");
    }


    displayGameJoinRoomInstructions() {
        this.displayMainScreen();
        this.displayPrimaryInstructions("Please join a room to begin.");
    }

    displayWinScreen(opponentRequestedRematch: boolean = false) {
        let drawText = () => {
            this.p.textSize(30);
            this.p.fill(this.app.turns[this.app.turn].color);
            this.p.stroke(255);
            this.p.strokeWeight(3);
            this.p.text("CONGRATULATIONS!\n" + this.app.turns[this.app.turn].name.toUpperCase() + " WON THE GAME", this.p.width / 2, this.p.height / 2 - 50);
            this.p.textSize(25);
            this.p.fill(0);
            this.p.stroke(255);
            this.p.strokeWeight(6);
            const prefix = opponentRequestedRematch ? "YOUR OPPONENT HAS REQUESTED A REMATCH\n" : "";
            this.p.text(prefix + 'CLICK TO REQUEST A REMATCH', this.p.width / 2, this.p.height / 2 + 50);
        }

        this.p.push();
        // https://p5js.org/reference/#/p5/drawingContext
        // @ts-ignore
        this.p.drawingContext.shadowOffsetX = 0;
        // @ts-ignore
        this.p.drawingContext.shadowOffsetY = 0;
        // @ts-ignore
        this.p.drawingContext.shadowBlur = 5;
        // @ts-ignore
        this.p.drawingContext.shadowColor = 'black';
        drawText();
        this.p.pop();

        // avoid shadow on the stroke part of the text
        drawText();


        // speech bubbles
        this.app.turns.forEach((v, t) => {
            this.p.image(this.app.turns[t].speech, this.app.turns[t].speechPos.x, this.app.turns[t].speechPos.y);
            this.p.textSize(19);
            this.p.text("Good Game!", this.app.turns[t].speechPos.x, this.app.turns[t].speechPos.y - 35);
        });
    }
}
