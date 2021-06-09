import p5, {Image} from "p5";
import {LogicService} from "./logic.service";
import {GetService} from "./get.service";
import {Turn} from "./models/turn.model";
import {EdgeSet} from "../../shared/models/edge-set.model";
import {Point} from "../../shared/models/point.model";
import {DisplayService} from "./display.service";
import {ClientService} from "../client/client.service";
import {SharedGameUtils} from "../../shared/shared.game.utils";
import {Utils} from "./utils";
import {SharedGameConstants} from "../../shared/constants/shared.game.constants";

export class SketchApp {
    p: p5;
    client: ClientService;


    tileWidth = SharedGameConstants.TILE_WIDTH;
    myScale = SharedGameConstants.SCALE;

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
    private userInRoom: boolean = false;
    private opponentInRoom: boolean = false;

    constructor(p: p5, client: ClientService) {
        this.p = p;
        this.client = client;

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

        this.registerClientListeners();
    }

    private registerClientListeners() {
        this.client.getUserInRoomObservable().subscribe((value: boolean) => {
            this.userInRoom = value;
        });
        this.client.getOpponentInRoomObservable().subscribe((value: boolean) => {
            this.opponentInRoom = value;
        })
    }


    setup() {
        const canvas = this.p.createCanvas(SharedGameConstants.CANVAS_WIDTH, SharedGameConstants.CANVAS_HEIGHT);
        canvas.mouseClicked(() => {
            this.mouseClicked()
            // prevent default
            return false;
        });

        this.p.textFont(this.comicFont, 48);
        this.points = SharedGameUtils.getPoints(this.p.width, this.p.height, this.tileWidth);
        this.turns = this.getService.getTurns();
        this.matrix = SharedGameUtils.getAdjacencyMatrix(this.points, this.tileWidth);
        this.edgeIndexes = SharedGameUtils.getEdgeIndexes();
        this.borderIndexes = SharedGameUtils.getBorderIndexes(this.points);
        this.turn = 0;
        this.started = false;
        this.won = false;
    }

    draw() {
        if (!this.userInRoom) {
            this.displayService.displayGameJoinRoomInstructions();
            return;
        }
        if (!this.opponentInRoom) {
            this.displayService.displayGameWaitingRoomInstructions();
            return;
        }
        if (!this.started) {
            this.displayService.displayGameWelcomeInstructions();
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
        if (this.userInRoom && !this.opponentInRoom) {
            return;
        }
        if (!this.started) {
            this.logicService.startGame();
            return;
        }
        if (this.won) {
            this.logicService.reset();
            return;
        }
        const closestIndex = Utils.findClosestPointIndex(this.points, this.p.mouseX, this.p.mouseY);
        if (closestIndex !== undefined) {
            this.client.onPointIndexClicked(closestIndex);
        }
        // if (this.logicService.clickClosestPoint()) {
        //     if (this.logicService.isThereAPath(this.turn, this.points, this.edgeIndexes, this.borderIndexes, this.matrix)) {
        //         this.logicService.winGame();
        //     } else {
        //         this.logicService.switchTurn();
        //     }
        // }
    }
}
