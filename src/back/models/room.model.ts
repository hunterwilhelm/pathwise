import {User} from "./user.model";

export interface Room {
    readonly id: string;
    users: User[];
    roomEmptySince?: Date;
}
