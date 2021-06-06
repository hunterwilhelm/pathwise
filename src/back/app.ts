import express, {Express, Request, Response} from 'express';
import path from "path";
import {Server as ServerIO, Socket} from "socket.io";
import cookieParser from "cookie-parser";
import {Server} from "http";
import {AppConstants} from "./app.constants";
import {EmitConstants} from "../shared/emit.constants";
import {AppUtils} from "./app.utils";
import {Game} from "./game";
import {Room} from "../shared/models/room.model";
import {RoomInfo} from "../shared/models/room.info.model";

const PORT = process.env.PORT || 3000;
const INDEX = './front/index.html';

class App {
    app: Express;
    server: Server;
    io: ServerIO;
    game: Game;

    constructor() {
        this.app = express();
        this.server = require('http').createServer(this.app);
        this.io = require('socket.io')(this.server);
        this.game = new Game();
        console.log(this.game);
    }


    init() {
        console.log(this.game);

        this.setup();
        this.setupRoutes();
        this.registerListeners();
        this.registerBroadcastsIntervals();
    }

    private setup() {
        this.app.use(cookieParser());
    }

    private setupRoutes() {
        this.app.get("/", this.onPageLoadEventHandler);
        this.app.use(express.static(path.join(__dirname, 'front')));
    }

    private registerListeners() {
        this.server.listen(PORT, App.onStartEventHandler);
        this.io.on("connection", (socket: Socket) => {
            this.onSocketConnectionEventHandler(socket)
        });
    }

    private static onStartEventHandler() {
        console.log(`Listening on ${PORT}`);
    }


    private registerBroadcastsIntervals() {
        let roomCount = this.game.getRoomInfos().length;
        setInterval(() => {
            const rooms = this.game.getRoomInfos();
            if (roomCount !== rooms.length) {
                roomCount = rooms.length;
                this.io.sockets.emit(EmitConstants.LIST_ROOM_INFOS, rooms);
            }
        }, 1000);
    }

    private onPageLoadEventHandler(request: Request, res: Response) {
        if (!request.cookies) {
            console.log("parseCookies was not used");
        } else {
            if (request.cookies.hasOwnProperty && request.cookies.hasOwnProperty(AppConstants.COOKIE_USER_ID)) {
                console.log("User refreshed page with cookie " + request.cookies[AppConstants.COOKIE_USER_ID]);
            } else {
                const userId = AppUtils.getRandomUserId();
                console.log("Set cookie: ", AppConstants.COOKIE_USER_ID, "to", userId)
                res.cookie(AppConstants.COOKIE_USER_ID, userId, {maxAge: 360000});
            }
            res.sendFile(INDEX, {root: __dirname});
        }
    }

    private onSocketConnectionEventHandler(socket: Socket) {
        const userId = AppUtils.getCookieFromSocket(socket, AppConstants.COOKIE_USER_ID);
        if (userId == null) {
            socket.emit(EmitConstants.ERROR, "Missing user id");
            socket.disconnect();
            return;
        }

        const onlineUsersSameId = this.game.getUsersById(userId);
        if (onlineUsersSameId.length > 0) {
            console.log("Trying to remove users with the same id", onlineUsersSameId.length)
            onlineUsersSameId.forEach(u => {
                u.socket.disconnect();
            });
            this.game.removeUser(userId);
        }

        this.game.addUser(userId, socket);


        socket.on("disconnect", () => {
            this.game.removeUser(userId);
            console.log('Got disconnected!');
        });
        socket.on(EmitConstants.RESPONSE, (response: string) => {
            console.log(response);
        });
        socket.on(EmitConstants.CREATE_ROOM, (roomInfo: RoomInfo) => {
            const room: Room = {
                id: AppUtils.getRandomRoomId(),
                users: this.game.getUsersById(userId),
                ...roomInfo
            };
            this.game.addRoom(room);
        });
        socket.on(EmitConstants.LIST_ROOM_INFOS, () => {
            this.io.sockets.emit(EmitConstants.LIST_ROOM_INFOS, this.game.getRoomInfos());
        });
    }

}


(new App()).init();
