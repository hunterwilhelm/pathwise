import cookie from "cookie";

export class CookieUtils {

    static deleteCookie(key: string) {
        document.cookie = `${key}= ; expires = Thu, 01 Jan 1970 00:00:00 GMT`
    }

    static setCookie(key: string, value: string) {
        document.cookie = cookie.serialize(key, value);
    }

    static getCookie(key: string): any {
        const cookieObject = cookie.parse(document.cookie);
        return cookieObject[key];
    }
}
