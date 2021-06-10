import cookie from "cookie";

export class CookieUtils {
    /**
     * Cookie functions
     */

    static deleteCookie(key: string) {
        /**
         * Set the cookie to expire
         */
        document.cookie = `${key}= ; expires = Thu, 01 Jan 1970 00:00:00 GMT`
    }

    static setCookie(key: string, value: string) {
        /**
         * The document takes care of not deleting the other cookies
         */
        document.cookie = cookie.serialize(key, value);
    }

    static getCookie(key: string): any {
        /**
         * Extract the cookie from the browser
         */
        const cookieObject = cookie.parse(document.cookie);
        return cookieObject[key];
    }
}
