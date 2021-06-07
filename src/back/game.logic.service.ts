import {GameDataService} from "./game.data.service";

export class GameLogicService {
    gameDataService: GameDataService;

    constructor(gameDataService: GameDataService) {
        this.gameDataService = gameDataService;
    }


}
