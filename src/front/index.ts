import {io, Socket} from "socket.io-client";
import {SharedEmitConstants} from "../shared/shared.emit.constants";
import {DomUtils} from "./dom.utils";
import {RoomInfo} from "../shared/models/room.info.model";


class Client {
    socket: Socket;

    constructor() {
        this.socket = io();
    }

    init() {
        this.setupDOM();
        this.registerConnectionListeners();
    }

    setupDOM() {
        document.querySelector('#create-room-button')?.addEventListener('click', () => {
            const room: RoomInfo = {name: "test server" + Math.random()};
            this.socket.emit(SharedEmitConstants.CREATE_ROOM, room);
        });
        document.querySelector('#list-rooms-button')?.addEventListener('click', () => {
            this.socket.emit(SharedEmitConstants.LIST_ROOM_INFOS);
        });
        DomUtils.displayStatus("Connecting...");
    }


    registerConnectionListeners() {
        this.socket.on("connect", () => {
            console.log("connection");
            DomUtils.displayStatus("Connected!");
        });
        this.socket.on("disconnect", (message) => {
            console.log("disconnect", message);
            DomUtils.displayStatus("Disconnected :(");
        });
        this.socket.on(SharedEmitConstants.MESSAGE, (message) => {
            console.log(SharedEmitConstants.MESSAGE, message);
        });
        this.socket.on(SharedEmitConstants.ERROR, (message) => {
            console.log(SharedEmitConstants.ERROR, message);
        });
        this.socket.on(SharedEmitConstants.LIST_ROOM_INFOS, (roomInfos: RoomInfo[]) => {
            console.log(SharedEmitConstants.LIST_ROOM_INFOS, roomInfos);
            DomUtils.displayRoomInfos(roomInfos)
        });
    }
}

window.addEventListener('load', () => {
    (new Client()).init();
});
