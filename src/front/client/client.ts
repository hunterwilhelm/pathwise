import {io, Socket} from "socket.io-client";
import {DomUtils} from "./dom.utils";
import {RoomInfo} from "../../shared/models/room.info.model";
import {SharedEmitConstants} from "../../shared/constants/shared.emit.constants";
import {CookieUtils} from "./cookie.utils";
import {SharedCookieConstants} from "../../shared/constants/shared.cookie.constants";


export class Client {
    socket: Socket;
    userId: string | undefined;

    constructor() {
        this.socket = io();
        this.init();
    }

    init() {
        this.setupDOM();
        this.registerConnectionListeners();
        this.registerRoomListeners();
        this.registerGameListeners();
    }

    setupDOM() {
        document.querySelector('#create-room-button')?.addEventListener('click', () => {
            this.socket.emit(SharedEmitConstants.ROOM_CREATE);
        });
        document.querySelector('#list-rooms-button')?.addEventListener('click', () => {
            this.socket.emit(SharedEmitConstants.ROOM_LIST_INFOS);
        });
        DomUtils.displayStatus("Connecting...");
    }


    registerConnectionListeners() {
        this.socket.on("connect", () => {
            console.log("connection");
            DomUtils.displayStatus("Connected!");
            this.userId = CookieUtils.getCookie(SharedCookieConstants.USER_ID);
            if (this.userId) {
                DomUtils.displayUserIdStatus(this.userId);
            } else {
                DomUtils.displayUserIdStatus("Server Error: Didn't receive user id");
            }
        });
        this.socket.on("disconnect", (message) => {
            console.log("disconnect", message);
            DomUtils.displayStatus("Disconnected :(");
        });

        let lastTimeout = 0;
        this.socket.on(SharedEmitConstants.ERROR, (message) => {
            clearTimeout(lastTimeout);
            DomUtils.displayErrorStatus(message);
            lastTimeout = window.setTimeout(() => DomUtils.displayErrorStatus(""), 3000);
        });
    }

    registerRoomListeners() {
        this.socket.on(SharedEmitConstants.ROOM_LIST_INFOS, (roomInfos: RoomInfo[]) => {
            if (this.userId) {
                DomUtils.displayRoomInfos(roomInfos, this.userId,
                    (roomInfo) => this.onJoinRoomEventHandler(roomInfo),
                    (roomInfo) => this.onLeaveRoomEventHandler(roomInfo),
                    () => this.onGameMessageEventHandler());


                const userId = this.userId;
                const userRooms = roomInfos.filter(r => r.userIds.includes(userId));
                if (userRooms.length) {
                    CookieUtils.setCookie(SharedCookieConstants.ROOM_ID, userRooms[0].id)
                } else {
                    CookieUtils.deleteCookie(SharedCookieConstants.ROOM_ID);
                }
            }
        });
    }

    registerGameListeners() {
        this.socket.on(SharedEmitConstants.GAME_MESSAGE, (message: string) => {
            alert(message);
        })
    }

    onJoinRoomEventHandler(roomInfo: RoomInfo) {
        this.socket.emit(SharedEmitConstants.ROOM_JOIN, roomInfo);
    }

    onLeaveRoomEventHandler(roomInfo: RoomInfo) {
        this.socket.emit(SharedEmitConstants.ROOM_LEAVE, roomInfo);
    }

    onGameMessageEventHandler() {
        this.socket.emit(SharedEmitConstants.GAME_MESSAGE, "hello");
    }
}
