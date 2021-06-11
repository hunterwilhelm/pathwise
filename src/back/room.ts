import {User} from "./models/user.model";
import {App} from "./app";
import {RoomInfo} from "../shared/models/room.info.model";
import {AppUtils} from "./app.utils";
import {Point} from "../shared/models/point.model";
import {EdgeSet} from "../shared/models/edge-set.model";
import {RoomSocketService} from "./room.socket.service";
import {TurnList} from "../shared/models/turn-list.model";
import {GameData} from "../shared/models/game-data.model";
import {SharedDataUtils} from "../shared/shared.data.utils";
import {SharedGameUtils} from "../shared/shared.game.utils";

export class Room {
    /**
     * This class manages the game logic of the room
     */
    private readonly ROOM_EXPIRATION_TIME_IN_MILLISECONDS: number = 2 * 1000;

    private socketService: RoomSocketService;

    readonly id: string;
    private roomEmptySince?: Date;
    // when someone leaves the game, they shouldn't move positions
    // unless they both leave
    private player1?: User;
    private player2?: User;
    private turn: number;
    private wonTurn?: number;
    private requestedRematchTurn?: number;

    points: Point[];
    readonly matrix: readonly number[][];
    readonly edgeIndexes: readonly EdgeSet[];
    readonly borderIndexes: readonly number[];
    readonly app: App;
    private startingTurn: number;

    constructor(app: App) {
        this.app = app;
        this.socketService = new RoomSocketService(this);

        this.id = AppUtils.getRandomRoomId(app.dataService);
        this.points = app.dataService.points.map(a => Object.assign({}, a));
        this.matrix = app.dataService.matrix;
        this.edgeIndexes = app.dataService.edgeIndexes;
        this.borderIndexes = app.dataService.borderIndexes;
        this.roomEmptySince = new Date();
        this.turn = 0;
        this.startingTurn = this.turn;
    }

    private reset() {
        /**
         * On rematch, this needs to be called to reset the game
         */
        this.points.forEach(p=>{
            p.turn = undefined;
        })
        this.switchStartingTurn();
        this.turn = this.startingTurn;
        this.wonTurn = undefined;
        this.requestedRematchTurn = undefined;
    }


    get isExpired(): boolean {
        /**
         * Avoid spamming
         */
        if (this.roomEmptySince) {
            const timeElapsed = new Date().getTime() - this.roomEmptySince.getTime();
            return timeElapsed > this.ROOM_EXPIRATION_TIME_IN_MILLISECONDS;
        }
        return false;
    }

    getRoomInfo(): RoomInfo {
        /**
         * For socket communication
         */
        return {
            id: this.id,
            userIds: this.users.map(u => u.id),
        };
    }

    joinRoom(user: User): boolean {
        /**
         * Players should not shift when they leave
         */
        if (this.player1 == null) {
            this.player1 = user;
        } else if (this.player2 == null) {
            this.player2 = user;
        } else {
            return false;
        }

        this.socketService.sendGameData();
        this.roomEmptySince = undefined;
        return true;
    }

    leaveRoom(userId: string) {
        /**
         * When a user leaves, many things need to happen
         */
        if (this.player1?.id === userId) {
            this.player1 = undefined;
        } else if (this.player2?.id === userId) {
            this.player2 = undefined;
        } else {
            return false;
        }
        if (this.users.length === 0) {
            this.roomEmptySince = new Date();
        } else {
            this.requestedRematchTurn = undefined;
            this.socketService.sendGameData();
        }
        return true;
    }

    get users(): User[] {
        /**
         * Used for counting how many people are in the room and for broadcasting
         */
        const users = [];
        if (this.player1) {
            users.push(this.player1);
        }
        if (this.player2) {
            users.push(this.player2);
        }
        return users;
    }

    private getUserById(userId: string): User | undefined {
        /**
         * Easy access to the users
         */
        if (this.player1?.id === userId) {
            return this.player1;
        } else if (this.player2?.id === userId) {
            return this.player2;
        }
        return undefined;
    }

    private getUserByCurrentTurn(turn: number | undefined): User | undefined {
        /**
         * Easy access to whose turn is it
         */
        if (turn === 0) return this.player1;
        if (turn === 1) return this.player2;
        return undefined;
    }

    private getTurnByUserId(userId: string): number | undefined {
        /**
         * Find out the position of the players
         */
        if (this.player1?.id === userId) {
            return 0;
        } else if (this.player2?.id === userId) {
            return 1;
        }
        return undefined;
    }

    switchTurn() {
        /**
         * Called after almost every tile action
         */
        this.turn = this.turn === 1 ? 0 : 1;
    }

    switchStartingTurn() {
        /**
         * Alternate whose turn it is first every time to make it more fair
         */
        this.startingTurn = this.startingTurn === 1 ? 0 : 1;
    }

    onPointIndexClickedEventHandler(userId: string, pointIndex: number): void {
        /**
         * Validate and execute the tile action
         */
        const user = this.getUserById(userId);
        if (!user) return;
        if (this.getUserByCurrentTurn(this.turn)?.id != userId) {
            this.socketService.sendErrorMessage(user, "It is not your turn.");
            return
        }
        if (pointIndex < this.points.length) {
            const p = this.points[pointIndex];
            if (!p.border && p.turn == null) {
                p.turn = this.turn;
                if (SharedGameUtils.isThereAPath(this.turn, this.points, this.edgeIndexes, this.borderIndexes, this.matrix)) {
                    this.wonTurn = this.turn;
                } else {
                    this.switchTurn();
                }
                this.socketService.sendGameData();
            } else {
                this.socketService.sendErrorMessage(user, "You cannot click there.");
            }
        }
    }

    onRematchRequestEventHandler(userId: string) {
        /**
         * Do the rematch
         */
        const turn = this.getTurnByUserId(userId);
        if (turn == null) return;
        if (this.requestedRematchTurn === turn) {
            this.socketService.sendErrorMessage(this.getUserById(userId), "Your opponent has already requested a rematch");
            return;
        }

        if (this.requestedRematchTurn != null) {
            this.reset();
        } else {
            this.requestedRematchTurn = turn;
        }
        this.socketService.sendGameData();
    }

    getTurnList(): TurnList {
        /**
         * Easier for compression
         */
        return this.points.map(u => u.turn);
    }

    getGameData(): GameData {
        /**
         * Returns all the information about the current game
         */
        return {
            turn: this.turn,
            turnUserId: this.getUserByCurrentTurn(this.turn)?.id,
            turnListCompressed: SharedDataUtils.encodeTurnList(this.getTurnList()),
            wonUserId: this.getUserByCurrentTurn(this.wonTurn)?.id,
            requestedRematchUserId: this.getUserByCurrentTurn(this.requestedRematchTurn)?.id
        };
    }


}
