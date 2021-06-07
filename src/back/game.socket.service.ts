import {User} from "./models/user.model";
import {SharedEmitConstants} from "../shared/constants/shared.emit.constants";
import {RoomInfo} from "../shared/models/room.info.model";
import {Room} from "./models/room.model";
import {AppUtils} from "./app.utils";
import {Socket} from "socket.io";
import {UserInfo} from "../shared/models/user.info.model";
import {SharedCookieConstants} from "../shared/constants/shared.cookie.constants";
import {App} from "./app";

export class GameSocketService {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    onSocketConnectionEventHandler(socket: Socket) {
        // validate
        const userId = AppUtils.getCookieFromSocket(socket, SharedCookieConstants.USER_ID);
        if (userId == null) {
            socket.emit(SharedEmitConstants.ERROR, "Missing user id");
            socket.disconnect();
            return;
        }
        const roomId = AppUtils.getCookieFromSocket(socket, SharedCookieConstants.ROOM_ID);
        const room: Room | undefined = roomId ? this.app.dataService.getRoomById(roomId) : undefined;
        // login
        AppUtils.removeAndDisconnectUsersByIdFromGame(this.app.dataService, userId);
        const user = this.app.dataService.addUser(userId, socket);
        if (room) {
            this.joinRoom(room, user);
            this.broadcastRoomInfos();
        }

        // update
        socket.emit(SharedEmitConstants.USER_INFO, <UserInfo>{id: user.id})
        this.broadcastRoomInfos();

        // register
        socket.on("disconnect", () => {
            this.app.dataService.logoutUser(user.id);
            console.log('Got disconnected!', user.id);
            this.broadcastRoomInfos();
        });
        this.registerRoomEvents(socket, user);
        this.registerGameEvents(socket, user);
    }


    private registerRoomEvents(socket: Socket, user: User) {
        socket.on(SharedEmitConstants.ROOM_CREATE, () => {
            if (this.createRoom(user)) {
                this.broadcastRoomInfos();
            } else {
                socket.emit(SharedEmitConstants.ERROR, "You are already in a room");
            }
        });
        socket.on(SharedEmitConstants.ROOM_JOIN, (roomInfo: RoomInfo) => {
            const room = this.app.dataService.getRoomById(roomInfo.id);
            if (room) {
                if (this.joinRoom(room, user)) {
                    this.broadcastRoomInfos();
                } else {
                    socket.emit(SharedEmitConstants.ERROR, "You are already in a different room");
                }
            } else {
                socket.emit(SharedEmitConstants.ERROR, "That room does not exist");
            }
        });
        socket.on(SharedEmitConstants.ROOM_LEAVE, (roomInfo: RoomInfo) => {
            const room = this.app.dataService.getRoomById(roomInfo.id);
            if (room) {
                this.app.dataService.leaveRoom(room.id, user.id);
                this.broadcastRoomInfos();
            } else {
                socket.emit(SharedEmitConstants.ERROR, "You are already in a room");
            }
        });
        socket.on(SharedEmitConstants.ROOM_LIST_INFOS, () => this.broadcastRoomInfos());
    }

    private registerGameEvents(socket: Socket, user: User) {
        socket.on(SharedEmitConstants.GAME_MESSAGE, (message) => {
            this.app.logicService.sendRoomMessage(user, message);
        })
    }

    private createRoom(user: User): boolean {
        if (this.app.dataService.getRoomInfosByUserId(user.id).length !== 0) return false;
        const room: Room = {
            id: AppUtils.getRandomRoomId(this.app.dataService),
            users: [user],
        };
        this.app.dataService.addRoom(room);
        return true;
    }

    private joinRoom(room: Room, user: User): boolean {
        if (this.app.dataService.getRoomInfosByUserId(user.id).length !== 0) return false;
        this.app.dataService.joinRoom(room, user);
        return true;
    }

    broadcastRoomInfos() {
        this.app.io.sockets.emit(SharedEmitConstants.ROOM_LIST_INFOS, this.app.dataService.getRoomInfos());
    }


    broadcastMessageToRoom(key: string, user: User, message: string) {
        this.app.dataService.getRoomsByUserId(user.id).forEach(r => {
            r.users.forEach(u => {
                u.socket.emit(key, message);
            })
        });
    }

}
