import {Room} from "./models/room.model";
import {User} from "./models/user.model";
import {Socket} from "socket.io";
import {RoomInfo} from "../shared/models/room.info.model";

export class Game {
    private rooms: Room[] = [];
    private users: User[] = [];
    private readonly ROOM_EXPIRATION_TIME_IN_MILLISECONDS: number = 2 * 1000;

    constructor() {
    }

    getUsersById(userId: string): User[] {
        return this.users.filter(u => u.id == userId);
    }

    addUser(userId: string, socket: Socket) {
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
        this.users = this.users.filter(u => u.id != userId);
        this.getRoomsByUserId(userId).forEach(r => {
            this.leaveRoom(r.id, userId)
        })
    }

    addRoom(room: Room) {
        this.rooms.push(room);
    }

    getRoomInfos(): RoomInfo[] {
        return this.rooms.map(r => {
            const roomInfo: RoomInfo = {
                userIds: r.users.map(u => u.id),
                id: r.id
            }
            return roomInfo;
        });
    }

    getRoomsByUserId(userId: string): RoomInfo[] {
        return this.rooms
            .filter(r => r.users.some(u => u.id === userId))
            .map(r => {
                const roomInfo: RoomInfo = {
                    userIds: r.users.map(u => u.id),
                    id: r.id
                }
                return roomInfo;
            });
    }

    getRoomById(roomId: string): Room | undefined {
        const foundRooms = this.rooms.filter(r => r.id == roomId);
        if (foundRooms.length) return foundRooms[0];
        return undefined;
    }

    joinRoom(room: Room, user: User) {
        room.users.push(user);
        room.roomEmptySince = undefined;
    }

    leaveRoom(roomId: string, userId: string) {
        this.rooms.forEach(r => {
            r.users = r.users.filter(u => u.id !== userId)
            if (r.users.length === 0) {
                r.roomEmptySince = new Date();
            }
        });
    }

    deleteExpiredRooms(): boolean {
        const roomCount = this.rooms.length;
        this.rooms = this.rooms.filter(r =>
            !(r.roomEmptySince && (new Date().getTime() - r.roomEmptySince.getTime() >= this.ROOM_EXPIRATION_TIME_IN_MILLISECONDS))
        );
        return roomCount !== this.rooms.length;
    }
}
