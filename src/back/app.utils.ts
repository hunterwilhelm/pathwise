import cookie from "cookie";
import {Socket} from "socket.io";

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

    static getRandomRoomId(): string {
        return AppUtils.generateRandomString('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4);
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
}
