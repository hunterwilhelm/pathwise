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

export class Room {
    private readonly ROOM_EXPIRATION_TIME_IN_MILLISECONDS: number = 2 * 1000;

    private socketService: RoomSocketService;

    readonly id: string;
    private roomEmptySince?: Date;
    // when someone leaves the game, they shouldn't move positions
    // unless they both leave
    private player1?: User;
    private player2?: User;
    private turn: number;
    // started: boolean;
    // won: boolean;

    points: Point[];
    readonly matrix: readonly number[][];
    readonly edgeIndexes: readonly EdgeSet[];
    readonly borderIndexes: readonly number[];

    constructor(app: App) {
        this.socketService = new RoomSocketService(this);

        this.id = AppUtils.getRandomRoomId(app.dataService);
        this.points = [...app.dataService.points];
        this.matrix = app.dataService.matrix;
        this.edgeIndexes = app.dataService.edgeIndexes;
        this.borderIndexes = app.dataService.borderIndexes;
        this.turn = 0;
        this.roomEmptySince = new Date();
    }


    get isExpired(): boolean {
        if (this.roomEmptySince) {
            const timeElapsed = new Date().getTime() - this.roomEmptySince.getTime();
            return timeElapsed < this.ROOM_EXPIRATION_TIME_IN_MILLISECONDS;
        }
        return false;
    }

    getRoomInfo(): RoomInfo {
        return {
            id: this.id,
            userIds: this.users.map(u => u.id),
        };
    }

    joinRoom(user: User): boolean {
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
        if (this.player1?.id === userId) {
            this.player1 = undefined;
        } else if (this.player2?.id === userId) {
            this.player2 = undefined;
        } else {
            return false;
        }
        if (this.users.length === 0) this.roomEmptySince = new Date();
        return true;
    }

    get users(): User[] {
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
        if (this.player1?.id === userId) {
            return this.player1;
        } else if (this.player2?.id === userId) {
            return this.player2;
        }
        return undefined;
    }

    switchTurn() {
        this.turn = this.turn === 1 ? 0 : 1;
    }

    getUserByCurrentTurn(): User | undefined {
        if (this.turn === 0) return this.player1;
        return this.player2;
    }

    onPointIndexClickedEventHandler(userId: string, pointIndex: number): void {
        const user = this.getUserById(userId);
        if (!user) return;
        if (pointIndex < this.points.length) {
            const p = this.points[pointIndex];
            if (!p.border && p.turn == null) {
                p.turn = this.turn;
                this.switchTurn();
                this.socketService.sendGameData();
            } else {
                this.socketService.sendErrorMessage(user, "You cannot click there.");
            }
        }
    }

    getTurnList(): TurnList {
        return this.points.map(u => u.turn);
    }

    getGameData(): GameData {
        return {
            turn: this.turn,
            turnUserId: this.getUserByCurrentTurn()?.id,
            turnListCompressed: SharedDataUtils.encodeTurnList(this.getTurnList())
        };
    }
}
