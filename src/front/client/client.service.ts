import {io, Socket} from "socket.io-client";
import {DomUtils} from "./dom.utils";
import {RoomInfo} from "../../shared/models/room.info.model";
import {SharedEmitConstants} from "../../shared/constants/shared.emit.constants";
import {CookieUtils} from "./cookie.utils";
import {SharedCookieConstants} from "../../shared/constants/shared.cookie.constants";
// @ts-ignore
import {BehaviorSubject, Observable} from "rxjs";

export class ClientService {
    socket: Socket;
    userId: string | undefined;

    private $userInRoom = new BehaviorSubject<boolean>(false);
    private $opponentInRoom = new BehaviorSubject<boolean>(false);

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
            this.socket.emit(SharedEmitConstants.ROOM_CREATE.toString());
        });
        document.querySelector('#list-rooms-button')?.addEventListener('click', () => {
            this.socket.emit(SharedEmitConstants.ROOM_LIST_INFOS.toString());
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
        this.socket.on(SharedEmitConstants.ERROR.toString(), (message) => {
            clearTimeout(lastTimeout);
            DomUtils.displayErrorStatus(message);
            lastTimeout = window.setTimeout(() => DomUtils.displayErrorStatus(""), 3000);
        });
    }

    registerRoomListeners() {
        this.socket.on(SharedEmitConstants.ROOM_LIST_INFOS.toString(), (roomInfos: RoomInfo[]) => {
            if (this.userId) {
                const userId = this.userId;
                const userRooms = roomInfos.filter(r => r.userIds.includes(userId));
                this.$userInRoom.next(userRooms.length > 0);
                this.$opponentInRoom.next(userRooms.every(r => {
                    return r.userIds.length > 1
                }));

                DomUtils.displayRoomInfos(
                    roomInfos,
                    this.$userInRoom.value,
                    this.userId,
                    (roomInfo) => this.onJoinRoomEventHandler(roomInfo),
                    (roomInfo) => this.onLeaveRoomEventHandler(roomInfo),
                    () => this.sendMessage()
                );


                if (userRooms.length) {
                    CookieUtils.setCookie(SharedCookieConstants.ROOM_ID, userRooms[0].id)
                } else {
                    CookieUtils.deleteCookie(SharedCookieConstants.ROOM_ID);
                }
            }
        });
    }

    registerGameListeners() {
        this.socket.on(SharedEmitConstants.GAME_MESSAGE.toString(), (message: string) => {
            alert(message);
        })
    }

    onJoinRoomEventHandler(roomInfo: RoomInfo) {
        this.socket.emit(SharedEmitConstants.ROOM_JOIN.toString(), roomInfo);
    }

    onLeaveRoomEventHandler(roomInfo: RoomInfo) {
        this.socket.emit(SharedEmitConstants.ROOM_LEAVE.toString(), roomInfo);
    }

    sendMessage() {
        this.socket.emit(SharedEmitConstants.GAME_MESSAGE.toString(), "hello");
    }

    getUserInRoomObservable(): Observable<boolean> {
        return this.$userInRoom.asObservable();
    }

    getOpponentInRoomObservable(): Observable<boolean> {
        return this.$opponentInRoom.asObservable();
    }

    onPointIndexClicked(pointIndex: number) {
        this.socket.emit(SharedEmitConstants.GAME_CLICKED_POINT_INDEX.toString(), pointIndex);
    }
}
