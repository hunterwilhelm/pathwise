import {User} from "./models/user.model";
import {Socket} from "socket.io";
import {RoomInfo} from "../shared/models/room.info.model";
import {Room} from "./room";
import {App} from "./app";
import {SharedGameUtils} from "../shared/shared.game.utils";
import {SharedGameConstants} from "../shared/constants/shared.game.constants";
import {Point} from "../shared/models/point.model";
import {EdgeSet} from "../shared/models/edge-set.model";

export class AppDataService {
    /**
     * This class manages the information of the backend
     */
    private rooms: Room[];
    private users: User[];

    readonly points: readonly Point[];
    readonly matrix: readonly number[][];
    readonly edgeIndexes: readonly EdgeSet[];
    readonly borderIndexes: readonly number[];


    constructor() {
        this.rooms = [];
        this.users = [];

        this.points = SharedGameUtils.getPoints(SharedGameConstants.CANVAS_WIDTH, SharedGameConstants.CANVAS_HEIGHT, SharedGameConstants.TILE_WIDTH);
        this.matrix = SharedGameUtils.getAdjacencyMatrix(this.points, SharedGameConstants.TILE_WIDTH);
        this.edgeIndexes = SharedGameUtils.getEdgeIndexes();
        this.borderIndexes = SharedGameUtils.getBorderIndexes(this.points);
    }

    getUsersById(userId: string): User[] {
        /**
         * Finds all the users with the specified userId
         */
        return this.users.filter(u => u.id == userId);
    }

    addUser(userId: string, socket: Socket) {
        /**
         * Adds a user to the app. Therefore, allowing the user access the the socket protocols
         */
        const user: User = {
            id: userId,
            socket: socket
        }
        this.users.push(user);
        console.log("User ", userId, "joined the game");
        console.log("There", this.users.length === 1 ? "is" : "are", this.users.length, "here");

        return user;
    }

    logoutUser(userId: string) {
        /**
         * Removes all users by userId and the user is taken out of rooms etc.
         */
        this.users = this.users.filter(u => u.id != userId);
        this.getRoomsByUserId(userId).forEach(r => r.leaveRoom(userId))
    }

    addRoom(app: App): Room {
        /**
         * Adds a room to the server. This is how a game is started.
         */
        const room = new Room(app);
        this.rooms.push(room);
        return room;
    }

    getRoomInfos(): RoomInfo[] {
        /**
         * Data for updating the table of rooms on the front end
         */
        return this.rooms.map(r => r.getRoomInfo());
    }

    getRoomsByUserId(userId: string): Room[] {
        /**
         * Finds all the rooms that a user is in
         */
        return this.rooms.filter(r => r.users.some(u => u.id === userId));
    }

    getRoomByUserId(userId: string): Room | undefined {
        /**
         * Returns what room a user is in
         * Otherwise, undefined
         */
        const rooms = this.getRoomsByUserId(userId);
        return rooms.length ? rooms[0] : undefined;
    }

    getRoomById(roomId: string): Room | undefined {
        /**
         * Used for identifying rooms
         */
        const foundRooms = this.rooms.filter(r => r.id == roomId);
        if (foundRooms.length) return foundRooms[0];
        return undefined;
    }

    deleteExpiredRooms(): boolean {
        /**
         * When a room is empty, we need to make sure it doesn't last forever
         */
        const roomCount = this.rooms.length;
        this.rooms = this.rooms.filter(r => !r.isExpired);
        return roomCount !== this.rooms.length;
    }
}
