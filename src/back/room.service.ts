import {User} from "./models/user.model";
import {App} from "./app";
import {RoomInfo} from "../shared/models/room.info.model";
import {AppUtils} from "./app.utils";
import {Point} from "../shared/models/point.model";
import {EdgeSet} from "../shared/models/edge-set.model";

export class RoomService {
    private readonly ROOM_EXPIRATION_TIME_IN_MILLISECONDS: number = 2 * 1000;

    readonly id: string;
    private roomEmptySince?: Date;
    // when someone leaves the game, they shouldn't move positions
    // unless they both leave
    private player1?: User;
    private player2?: User;
    // turn: number;
    // started: boolean;
    // won: boolean;

    readonly points: readonly Point[];
    readonly matrix: readonly number[][];
    readonly edgeIndexes: readonly EdgeSet[];
    readonly borderIndexes: readonly number[];

    constructor(app: App) {
        this.id = AppUtils.getRandomRoomId(app.dataService);
        this.points = app.dataService.points;
        this.matrix = app.dataService.matrix;
        this.edgeIndexes = app.dataService.edgeIndexes;
        this.borderIndexes = app.dataService.borderIndexes;
    }


    get isExpired(): boolean {
        if (this.roomEmptySince) {
            const timeElapsed = new Date().getTime() - this.roomEmptySince.getTime();
            return timeElapsed < this.ROOM_EXPIRATION_TIME_IN_MILLISECONDS;
        }
        return false;
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


    onPointIndexClickedEventHandler(user: User, pointIndex: number) {
        console.log(user.id, "clicked", pointIndex);
    }

    getRoomInfo(): RoomInfo {
        return {
            id: this.id,
            userIds: this.users.map(u => u.id),
        };
    }

    joinRoom(user: User): boolean {
        if (this.player1 === undefined) {
            this.player1 = user;
        } else if (this.player2 === undefined) {
            this.player2 = user;
        } else {
            return false;
        }
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
        return true;
    }
}
