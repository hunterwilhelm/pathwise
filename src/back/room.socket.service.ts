import {User} from "./models/user.model";
import {SharedEmitConstants} from "../shared/constants/shared.emit.constants";
import {Room} from "./room";

export class RoomSocketService {
    /**
     * This class manages the socket protocols of the room
     */
    private room: Room;

    constructor(room: Room) {
        this.room = room;
    }


    sendErrorMessage(user: User | undefined, message: string) {
        /**
         * Let the user know why their action was denied
         */
        user?.socket.emit(SharedEmitConstants.GAME_ERROR.toString(), message);
    }

    sendGameData() {
        /**
         * Update everything that has to do with the game variables
         */
        this.room.users.forEach(u => {
            u.socket.emit(SharedEmitConstants.SEND_GAME_DATA.toString(), this.room.getGameData());
        });
    }
}
