import {User} from "./models/user.model";
import {App} from "./app";
import {SharedEmitConstants} from "../shared/constants/shared.emit.constants";

export class GameLogicService {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    sendRoomMessage(user: User, message: string) {
        this.app.socketService.broadcastMessageToRoom(SharedEmitConstants.GAME_MESSAGE, user, message);
    }
}
