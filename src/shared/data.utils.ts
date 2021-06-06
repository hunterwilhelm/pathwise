import cookie from "cookie";
import {Socket} from "socket.io";

export class DataUtils {
    static getRandomConnectionId(): string {
        const chars: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const length: number = 32;
        let result: string = '';
        for (let i: number = length; i > 0; --i) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
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
