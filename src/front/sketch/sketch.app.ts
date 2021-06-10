import p5, {Image} from "p5";
import {Turn} from "./models/turn.model";
import {EdgeSet} from "../../shared/models/edge-set.model";
import {Point} from "../../shared/models/point.model";
import {SketchDisplayService} from "./sketch.display.service";
import {ClientService} from "../client/client.service";
import {SharedGameUtils} from "../../shared/shared.game.utils";
import {SketchUtils} from "./sketch.utils";
import {SharedGameConstants} from "../../shared/constants/shared.game.constants";
import {GameData} from "../../shared/models/game-data.model";
import {SharedDataUtils} from "../../shared/shared.data.utils";

export class SketchApp {
    p: p5;
    client: ClientService;


    tileWidth = SharedGameConstants.TILE_WIDTH;
    myScale = SharedGameConstants.SCALE;

    displayService: SketchDisplayService;

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
    isUsersTurn: boolean = false;
    private rematchRequestSent: boolean = false;
    private requestedRematchUserId?: string;
    private lastTimeout: number = 0;
    private errorMessage?: string;

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

        this.displayService = new SketchDisplayService(p, this);

        this.registerClientListeners();
    }

    private registerClientListeners() {
        /**
         * Every time the BehaviorSubjects are changed, the subscriptions are called.
         */
        this.client.getUserInRoomObservable().subscribe((value: boolean) => {
            this.userInRoom = value;
        });
        this.client.getOpponentInRoomObservable().subscribe((value: boolean) => {
            this.opponentInRoom = value;
        })
        this.client.getGameDataAsObservable().subscribe((gameData: GameData | undefined) => {
            if (gameData) {
                SharedDataUtils.decodeTurnList(gameData.turnListCompressed)
                    .forEach((v, i) => {
                        if (i < this.points.length) {
                            this.points[i].turn = v;
                            if (v != undefined) this.started = true;
                        }
                    });
                this.turn = gameData.turn;
                this.isUsersTurn = gameData.turnUserId == this.client.userId;
                this.won = gameData.wonUserId != null;
                this.requestedRematchUserId = gameData.requestedRematchUserId;
                if (!this.requestedRematchUserId) {
                    this.rematchRequestSent = false;
                }
            }
        });
        this.client.getGameErrorMessageAsObservable().subscribe((message: string) => {
            this.showErrorMessage(message);
        })
    }


    setup() {
        const canvas = this.p.createCanvas(SharedGameConstants.CANVAS_WIDTH, SharedGameConstants.CANVAS_HEIGHT);
        canvas.parent("sketch");
        canvas.mouseClicked(() => {
            this.mouseClicked()
            // prevent default
            return false;
        });

        this.p.textFont(this.comicFont, 48);
        this.points = SharedGameUtils.getPoints(this.p.width, this.p.height, this.tileWidth);
        this.turns = SketchUtils.getTurns(this, this.p);
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
        if (this.rematchRequestSent) {
            this.displayService.displayGameAwaitingRematchInstructions();
            return;
        }
        this.displayService.displayBackground();
        this.displayService.displayBoard();
        this.displayService.displayHUD(this.errorMessage);
        if (this.won) {
            this.displayService.displayWinScreen(!!this.requestedRematchUserId);
            return;
        }
    }

    mouseClicked() {
        if (this.userInRoom && !this.opponentInRoom) {
            return;
        }
        if (!this.started) {
            this.started = true;
            return;
        }
        if (this.won) {
            if (!this.requestedRematchUserId) {
                this.rematchRequestSent = true;
            }
            this.client.onRematchRequested();
            return;
        }
        if (!this.isUsersTurn) {
            this.showErrorMessage("It is not your turn");
            return;
        }
        const closestIndex = SketchUtils.findClosestPointIndex(this.points, this.p.mouseX, this.p.mouseY);
        if (closestIndex != null) {
            this.client.onPointIndexClicked(closestIndex);
        } else {
            this.showErrorMessage("Not a valid tile");
        }
    }

    showErrorMessage(message: string) {
        /**
         * For a limited time, sets the error message when the user does something wrong
         */
        this.errorMessage = message;
        clearTimeout(this.lastTimeout);
        this.lastTimeout = window.setTimeout(() => {this.errorMessage = undefined;}, 3000);
    }
}
