import {SketchApp} from "./sketch.app";
import p5 from "p5";
import {Turn} from "./models/turn.model";

export class GetService {

    private app: SketchApp;
    private p: p5;

    constructor(p: p5, app: SketchApp) {
        this.app = app;
        this.p = p;
    }

    getTurns(): Turn[] {
        return [
            {
                name: 'Green',
                color: "#78D154",
                img: this.app.imgStar2,
                speech: this.app.imgSpeech2,
                speechPos: {
                    x: this.p.width / 2 - 375,
                    y: this.p.height / 2 + 135
                }
            },
            {
                name: 'Blue',
                color: "#4EB1E8",
                img: this.app.imgStar3,
                speech: this.app.imgSpeech1,
                speechPos: {
                    x: this.p.width / 2 + 390,
                    y: this.p.height / 2 + 275
                }
            }
        ];
    }

}
