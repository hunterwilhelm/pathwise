import {io, Socket} from "socket.io-client";
import {DomUtils} from "./dom.utils";
import {RoomInfo} from "../../shared/models/room.info.model";
import {SharedEmitConstants} from "../../shared/constants/shared.emit.constants";
import {CookieUtils} from "./cookie.utils";
import {SharedCookieConstants} from "../../shared/constants/shared.cookie.constants";
// @ts-ignore
import {BehaviorSubject, Observable} from "rxjs";
import {GameData} from "../../shared/models/game-data.model";

export class ClientService {
    socket: Socket;
    userId: string | undefined;
    lastTimeout: number = 0;

    private $userInRoom = new BehaviorSubject<boolean>(false);
    private $opponentInRoom = new BehaviorSubject<boolean>(false);
    private $gameData = new BehaviorSubject<GameData | undefined>(undefined);

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
            DomUtils.displayStatus("Connected! - Pathwise Online Multiplayer");
            this.userId = CookieUtils.getCookie(SharedCookieConstants.USER_ID);
        });
        this.socket.on("disconnect", () => {
            DomUtils.displayStatus("Disconnected - Pathwise Online Multiplayer");
        });

        this.socket.on(SharedEmitConstants.ERROR.toString(), (message) => {
            this.lastTimeout = DomUtils.displayErrorStatus(message, this.lastTimeout);
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
        this.socket.on(SharedEmitConstants.SEND_GAME_DATA.toString(), (gameData: GameData) => {
            this.$gameData.next(gameData);
        })
    }

    onJoinRoomEventHandler(roomInfo: RoomInfo) {
        this.socket.emit(SharedEmitConstants.ROOM_JOIN.toString(), roomInfo);
    }

    onLeaveRoomEventHandler(roomInfo: RoomInfo) {
        this.socket.emit(SharedEmitConstants.ROOM_LEAVE.toString(), roomInfo);
    }

    getUserInRoomObservable(): Observable<boolean> {
        return this.$userInRoom.asObservable();
    }

    getOpponentInRoomObservable(): Observable<boolean> {
        return this.$opponentInRoom.asObservable();
    }

    getGameDataAsObservable(): Observable<GameData | undefined> {
        return this.$gameData.asObservable();
    }

    onPointIndexClicked(pointIndex: number) {
        this.socket.emit(SharedEmitConstants.GAME_CLICKED_POINT_INDEX.toString(), pointIndex);
    }

    onRematchRequested() {
        this.socket.emit(SharedEmitConstants.GAME_REQUEST_REMATCH.toString());
    }
}
