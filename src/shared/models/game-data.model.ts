import {TurnListCompressed} from "./turn-list.compressed.model";

export interface GameData {
    /**
     * Socket communication of the game state
     */
    turnListCompressed: TurnListCompressed;
    turn: number;
    turnUserId: string | undefined;
    wonUserId: string | undefined;
    requestedRematchUserId: string | undefined;
}
