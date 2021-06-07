import {SketchApp} from "./sketch.app";
import p5 from "p5";
import {Utils} from "./utils";

export class DisplayService {

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
        let closestIndex = Utils.findClosestPointIndex(this.app.points, this.p.mouseX, this.p.mouseY);
        if (this.app.won) closestIndex = undefined;

        this.app.points.forEach((p, i) => {
            if (closestIndex === i) {
                this.p.image(this.app.turns[this.app.turn].img, p.x, p.y, this.app.w*2, this.app.w*2);
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
            if (p.img) {
                this.p.image(p.img, p.x, p.y, this.app.w*2, this.app.w*2);
            } else {
                this.p.image(this.app.imgStar1, p.x, p.y, this.app.w*2, this.app.w*2);
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
        this.p.text(this.app.turns[this.app.turn].name + (this.app.won ? " won!" : "'s turn"), X, Y - 5);

        // speech bubbles
        if (!this.app.won) {
            this.p.image(this.app.turns[this.app.turn].speech, this.app.turns[this.app.turn].speechPos.x, this.app.turns[this.app.turn].speechPos.y);
            this.p.text("My turn!", this.app.turns[this.app.turn].speechPos.x, this.app.turns[this.app.turn].speechPos.y - 35);
        }
    }

    displayGameWelcome() {

        // background
        this.p.background(0);
        this.p.noStroke();
        this.p.fill("#C8C9C8");
        this.p.rectMode(this.p.CENTER);
        this.p.rect(this.p.width / 2, this.p.height / 2, this.app.myScale * this.app.imgBackground.width + 20 * this.app.myScale, this.app.myScale * this.app.imgBackground.height + 20 * this.app.myScale);
        this.p.fill(255);
        this.p.rect(this.p.width / 2, this.p.height / 2, this.app.myScale * this.app.imgBackground.width, this.app.myScale * this.app.imgBackground.height);

        // text
        this.p.noStroke();
        this.p.fill(this.app.turns[1].color);
        this.p.textSize(56);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.text("Pathwise", this.p.width / 2, this.p.height / 2 - 275);
        this.p.imageMode(this.p.CENTER);

        this.p.textSize(35);
        this.p.fill(30);
        this.p.stroke(30);
        this.p.strokeWeight(1);
        this.p.text("On your turn, click on any tile\nto change it to your color. Your goal is\nto create a pathway that connects\nthe two sides of your color.", this.p.width / 2, this.p.height / 2);

        this.p.textSize(30);
        this.p.fill(this.app.turns[1].color);
        this.p.noStroke();
        this.p.text("Press anywhere to begin", this.p.width / 2, this.p.height / 2 + 200);


        // icons
        this.p.image(this.app.turns[1].img, this.p.width / 2 - 200, this.p.height / 2 - 270);
        this.p.image(this.app.turns[0].img, this.p.width / 2 + 200, this.p.height / 2 - 270);


    }

    displayWinScreen() {
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
            this.p.text('CLICK ANYWHERE TO RESTART THE GAME', this.p.width / 2, this.p.height / 2 + 50);
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
