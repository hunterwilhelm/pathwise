import p5, {Image} from "p5";
import {LogicService} from "./logic.service";
import {GetService} from "./get.service";
import {Turn} from "./models/turn.model";
import {EdgeSet} from "./models/edge-set.model";
import {Point} from "./models/point.model";
import {DisplayService} from "./display.service";

export class SketchApp {
    p: p5;
    logicService: LogicService;
    getService: GetService;
    displayService: DisplayService;

    imgBackground: Image;
    imgStar1: Image;
    imgStar2: Image;
    imgStar3: Image;
    imgSpeech1: Image;
    imgSpeech2: Image;
    comicFont: string | object;
    points: Point[];
    turns: Turn[];
    turn: number;
    started: boolean;
    won: boolean;
    matrix: number[][];
    edgeIndexes: EdgeSet[];
    borderIndexes: number[];

    constructor(p: p5) {
        this.p = p;
        this.imgBackground = this.p.loadImage("assets/pathwise.png");
        this.imgStar1 = p.loadImage("assets/star1.png");
        this.imgStar2 = p.loadImage("assets/star2.png");
        this.imgStar3 = p.loadImage("assets/star3.png");
        this.imgSpeech1 = p.loadImage("assets/speech.png");
        this.imgSpeech2 = p.loadImage("assets/speech2.png");

        this.comicFont = p.loadFont("assets/ArchitectsDaughter-Regular.ttf");

        this.points = [];
        this.turns = [];
        this.matrix = [];
        this.edgeIndexes = [];
        this.borderIndexes = [];
        this.turn = 0;
        this.started = false;
        this.won = false;

        this.logicService = new LogicService(p, this);
        this.getService = new GetService(p, this);
        this.displayService = new DisplayService(p, this);
    }


    x = 100;
    y = 100;
    w = 30;
    myScale = 1;


    setup() {
        this.p.textFont(this.comicFont, 48);
        this.p.createCanvas(this.p.windowWidth, this.p.windowHeight);
        this.points = this.getService.getPoints();
        this.turns = this.getService.getTurns();
        this.matrix = this.getService.getAdjacencyMatrix();
        this.edgeIndexes = this.getService.getEdgeIndexes();
        this.borderIndexes = this.getService.getBorderIndexes();
        this.turn = 0;
        this.started = false;
        this.won = false;
    }

    draw() {
        if (!this.started) {
            this.displayService.displayGameWelcome();
            return;
        }
        this.displayService.displayBackground();
        this.displayService.displayBoard();
        this.displayService.displayHUD();
        if (this.won) {
            this.displayService.displayWinScreen();
            return;
        }
    }

    mouseClicked() {
        if (!this.started) {
            this.logicService.startGame();
            return;
        }
        if (this.won) {
            this.logicService.reset();
            return;
        }
        if (this.logicService.clickClosestPoint()) {
            if (this.logicService.isThereAPath(this.turn, this.points, this.edgeIndexes, this.borderIndexes, this.matrix)) {
                this.logicService.winGame();
            } else {
                this.logicService.switchTurn();
            }
        }
    }
}
