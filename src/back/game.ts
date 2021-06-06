import {Room} from "./models/room.model";
import {User} from "./models/user.model";
import {Socket} from "socket.io";

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
}
