export abstract class SharedCookieConstants {
    private static readonly PREFIX: string = 'pathwise-';
    static readonly USER_ID: string = SharedCookieConstants.PREFIX + 'user-id';
    static readonly ROOM_ID: string = SharedCookieConstants.PREFIX + 'room-id';
}
