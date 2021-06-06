import {Room} from "../shared/models/room.model";
import {User} from "./models/user.model";
import {Socket} from "socket.io";
import {RoomInfo} from "../shared/models/room.info.model";

export class Game {
    private rooms: Room[] = [];
    private users: User[] = []

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
        console.log("There are", this.users.length, "here")
    }

    removeUser(userId: string) {
        this.users = this.users.filter(u => u.id != userId);
    }

    addRoom(room: Room) {
        this.rooms.push(room);
    }

    getRoomInfos(): RoomInfo[] {
        return this.rooms.map(r => {
            const roomInfo: RoomInfo = {
                name: r.name,
                userCount: r.users.length,
                id: r.id
            }
            return roomInfo;
        });
    }
}
