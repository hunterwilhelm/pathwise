import {Socket} from "socket.io";


export interface User {
    /**
    Data to identify the user and communicate through the socket
     */
    id: string;
    socket: Socket;
}
