import {GameDataService} from "./game.data.service";
import {User} from "./models/user.model";
import {SharedEmitConstants} from "../shared/constants/shared.emit.constants";

export class GameLogicService {
    gameDataService: GameDataService;

    constructor(gameDataService: GameDataService) {
        this.gameDataService = gameDataService;
    }

    sendRoomMessage(user: User, message: string) {
        this.gameDataService.getRoomsByUserId(user.id).forEach(r => {
            r.users.forEach(u => {
                u.socket.emit(SharedEmitConstants.GAME_MESSAGE, message);
            })
        });
    }
}
