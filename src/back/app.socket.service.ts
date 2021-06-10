import {User} from "./models/user.model";
import {SharedEmitConstants} from "../shared/constants/shared.emit.constants";
import {RoomInfo} from "../shared/models/room.info.model";
import {AppUtils} from "./app.utils";
import {Socket} from "socket.io";
import {UserInfo} from "../shared/models/user.info.model";
import {SharedCookieConstants} from "../shared/constants/shared.cookie.constants";
import {App} from "./app";
import {Room} from "./room";

export class AppSocketService {
    /**
     * This class manages the socket protocols of the back end
     */
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    onSocketConnectionEventHandler(socket: Socket) {
        /**
         * When a user connects, setup cookies and make sure everything is in order
         */
        // validate
        const userId = AppUtils.getCookieFromSocket(socket, SharedCookieConstants.USER_ID);
        if (userId == null) {
            socket.emit(SharedEmitConstants.ROOM_ERROR.toString(), "Missing user id");
            socket.disconnect();
            return;
        }
        const roomId = AppUtils.getCookieFromSocket(socket, SharedCookieConstants.ROOM_ID);
        const room: Room | undefined = roomId ? this.app.dataService.getRoomById(roomId) : undefined;
        // login
        AppUtils.removeAndDisconnectUsersByIdFromGame(this.app.dataService, userId);
        const user = this.app.dataService.addUser(userId, socket);
        if (room) {
            if (room.joinRoom(user)) {
                this.broadcastRoomInfos();
            } else {
                socket.emit(SharedEmitConstants.ROOM_ERROR.toString(), "Room is full")
            }
        }

        // update
        socket.emit(SharedEmitConstants.USER_INFO.toString(), <UserInfo>{id: user.id})
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
        /**
         * Setup the room protocols
         */
        socket.on(SharedEmitConstants.ROOM_CREATE.toString(), () => {
            /**
             * Called when a user creates a room
             */
            if (!this.createRoom(user)) {
                socket.emit(SharedEmitConstants.ROOM_ERROR.toString(), "You are already in a room");
            } else {
                this.broadcastRoomInfos();
            }
        });
        socket.on(SharedEmitConstants.ROOM_JOIN.toString(), (roomInfo: RoomInfo) => {
            /**
             * Called when a user joins a room
             */
            const room = this.app.dataService.getRoomById(roomInfo.id);
            if (!room) {
                socket.emit(SharedEmitConstants.ROOM_ERROR.toString(), "That room does not exist");
                return;
            }
            if (this.app.dataService.getRoomsByUserId(user.id).length !== 0) {
                socket.emit(SharedEmitConstants.ROOM_ERROR.toString(), "You are already in a room");
                return;
            }
            if (!room.joinRoom(user)) {
                socket.emit(SharedEmitConstants.ROOM_ERROR.toString(), "That room is full");
                return;
            }
            this.broadcastRoomInfos();

        });
        socket.on(SharedEmitConstants.ROOM_LEAVE.toString(), (roomInfo: RoomInfo) => {
            /**
             * Called when a user leaves a room
             */
            const room = this.app.dataService.getRoomById(roomInfo.id);
            if (!room) {
                socket.emit(SharedEmitConstants.ROOM_ERROR.toString(), "That room does not exist");
            } else {
                if (!room.leaveRoom(user.id)) {
                    socket.emit(SharedEmitConstants.ROOM_ERROR.toString(), "You are not in that room");
                } else {
                    this.broadcastRoomInfos();
                }
            }
        });
        socket.on(SharedEmitConstants.ROOM_LIST_INFOS.toString(), () => this.broadcastRoomInfos());
    }

    private registerGameEvents(socket: Socket, user: User) {
        socket.on(SharedEmitConstants.GAME_CLICKED_POINT_INDEX.toString(), (pointIndex: number) => {
            /**
             * Called when a user tries to click on a tile
             * THe server validates the action
             */
            const userRoom = this.app.dataService.getRoomByUserId(user.id);
            if (userRoom) {
                userRoom.onPointIndexClickedEventHandler(user.id, pointIndex);
            }
        });
        socket.on(SharedEmitConstants.GAME_REQUEST_REMATCH.toString(), () => {
            /**
             * Called when a user requests a rematch
             * Both users have to agree before the next match is started
             */
            const userRoom = this.app.dataService.getRoomByUserId(user.id);
            if (userRoom) {
                userRoom.onRematchRequestEventHandler(user.id);
            }
        });
    }

    private createRoom(user: User): boolean {
        /**
         * Makes a room and puts the room creator in it
         */
        if (this.app.dataService.getRoomsByUserId(user.id).length !== 0) return false;
        this.app.dataService
            .addRoom(this.app)
            .joinRoom(user);
        return true;
    }

    broadcastRoomInfos() {
        /**
         * Update all of the clients that are connected of the room list
         */
        this.app.io.sockets.emit(SharedEmitConstants.ROOM_LIST_INFOS.toString(), this.app.dataService.getRoomInfos());
    }

}
