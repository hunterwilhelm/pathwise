import cookie from "cookie";
import {Socket} from "socket.io";
import {Game} from "./game";

export class AppUtils {
    private static generateRandomString(chars: string, len: number) {
        let result: string = '';
        for (let i: number = len; i > 0; --i) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }

    static getRandomUserId(): string {
        return AppUtils.generateRandomString('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 32);
    }

    static getRandomRoomId(game: Game): string {
        do {
            const id = AppUtils.generateRandomString('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4);
            if (!game.getRoomById(id)) {
                return id;
            }
        } while (true);
    }


    static getCookieFromSocket(socket: Socket, cookieKey: string): string | undefined {
        const requestCookie = socket.handshake.headers.cookie;
        if (requestCookie) {
            const cookies = cookie.parse(requestCookie);
            if (cookies.hasOwnProperty(cookieKey)) {
                return cookies[cookieKey];
            }
        }
        return undefined;
    }

    static removeAndDisconnectUsersByIdFromGame(game: Game, userId: string) {
        const onlineUsersSameId = game.getUsersById(userId);
        if (onlineUsersSameId.length > 0) {
            console.log("Trying to remove users with the same id", onlineUsersSameId.length)
            onlineUsersSameId.forEach(u => {
                u.socket.disconnect();
            });
            game.logoutUser(userId);
        }
    }

    static sanitizeRoomName(roomName: string): string {
        const allowedCharacters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ";
        const length = 20;

        const sanitized = roomName.split("").filter(c => allowedCharacters.includes(c)).join("");
        // trim
        return sanitized.length > length ?
            sanitized.substring(0, length - 3) + "..." :
            sanitized;
    }
}
