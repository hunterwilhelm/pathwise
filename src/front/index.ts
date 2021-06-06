import {io, Socket} from "socket.io-client";
import {EmitConstants} from "../shared/emit.constants";
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
            this.socket.emit(EmitConstants.CREATE_ROOM, room);
        });
        document.querySelector('#list-rooms-button')?.addEventListener('click', () => {
            this.socket.emit(EmitConstants.LIST_ROOM_INFOS);
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
        this.socket.on(EmitConstants.MESSAGE, (message) => {
            console.log(EmitConstants.MESSAGE, message);
        });
        this.socket.on(EmitConstants.ERROR, (message) => {
            console.log(EmitConstants.ERROR, message);
        });
        this.socket.on(EmitConstants.LIST_ROOM_INFOS, (roomInfos: RoomInfo[]) => {
            console.log(EmitConstants.LIST_ROOM_INFOS, roomInfos);
            DomUtils.displayRoomInfos(roomInfos)
        });
    }
}

window.addEventListener('load', () => {
    (new Client()).init();
});
