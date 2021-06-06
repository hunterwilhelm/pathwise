import {Socket} from "socket.io";

export interface User {
    id: string;
    socket: Socket;
}
