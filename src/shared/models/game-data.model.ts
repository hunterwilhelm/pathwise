import {TurnListCompressed} from "./turn-list.compressed.model";

export interface GameData {
    turnListCompressed: TurnListCompressed;
    turn: number;
    turnUserId: string | undefined;
    wonUserId: string | undefined;
    requestedRematchUserId: string | undefined;
}
