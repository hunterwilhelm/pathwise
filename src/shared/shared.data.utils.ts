import {TurnList} from "./models/turn-list.model";
import {TurnListCompressed} from "./models/turn-list.compressed.model";

export class SharedDataUtils {
    /**
     * Save bandwidth when communicating
     */
    static encodeTurnList(turnList: TurnList): TurnListCompressed {
        return turnList.map(t => {
            if (t == 0) return 1;
            if (t == 1) return 2;
            return 0;
        }).join("");
    }

    static decodeTurnList(turnList: TurnListCompressed): TurnList {
        return turnList.split("").map(t => {
            if (t == "1") return 0;
            if (t == "2") return 1;
            return undefined;
        });
    }
}
