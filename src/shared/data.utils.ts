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
}
