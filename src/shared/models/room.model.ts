import {User} from "../../back/models/user.model";

export interface Room {
    readonly name: string;
    readonly id: string;
    users: User[];
}
