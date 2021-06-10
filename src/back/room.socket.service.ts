import {User} from "./models/user.model";
import {SharedEmitConstants} from "../shared/constants/shared.emit.constants";
import {Room} from "./room";

export class RoomSocketService {
    private room: Room;

    constructor(room: Room) {
        this.room = room;
    }


    sendErrorMessage(user: User | undefined, message: string) {
        user?.socket.emit(SharedEmitConstants.GAME_ERROR.toString(), message);
    }

    sendGameData() {
        this.room.users.forEach(u => {
            u.socket.emit(SharedEmitConstants.SEND_GAME_DATA.toString(), this.room.getGameData());
        });
    }
}
