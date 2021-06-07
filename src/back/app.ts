import express, {Express, Request, Response} from 'express';
import path from "path";
import {Server as ServerIO, Socket} from "socket.io";
import cookieParser from "cookie-parser";
import {Server} from "http";
import {SharedEmitConstants} from "../shared/constants/shared.emit.constants";
import {AppUtils} from "./app.utils";
import {Game} from "./game";
import {Room} from "./models/room.model";
import {RoomInfo} from "../shared/models/room.info.model";
import {User} from "./models/user.model";
import {UserInfo} from "../shared/models/user.info.model";
import {SharedCookieConstants} from "../shared/constants/shared.cookie.constants";

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
        this.init();
    }


    init() {
        this.setup();
        this.setupRoutes();
        this.registerListeners();
        this.registerCheckers();
    }

    private setup() {
        this.app.use(cookieParser());
    }

    private setupRoutes() {
        this.app.get("/", App.onPageLoadEventHandler);
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


    private static onPageLoadEventHandler(request: Request, res: Response) {
        if (!request.cookies) {
            console.log("parseCookies was not used");
        } else {
            if (request.cookies.hasOwnProperty && request.cookies.hasOwnProperty(SharedCookieConstants.USER_ID)) {
                console.log("User refreshed page with cookie " + request.cookies[SharedCookieConstants.USER_ID]);
            } else {
                const userId = AppUtils.getRandomUserId();
                console.log("Set cookie: ", SharedCookieConstants.USER_ID, "to", userId)
                res.cookie(SharedCookieConstants.USER_ID, userId, {maxAge: 360000});
            }
            res.sendFile(INDEX, {root: __dirname});
        }
    }

    private onSocketConnectionEventHandler(socket: Socket) {

        // validate
        const userId = AppUtils.getCookieFromSocket(socket, SharedCookieConstants.USER_ID);
        if (userId == null) {
            socket.emit(SharedEmitConstants.ERROR, "Missing user id");
            socket.disconnect();
            return;
        }
        const roomId = AppUtils.getCookieFromSocket(socket, SharedCookieConstants.ROOM_ID);
        const room: Room | undefined = roomId ? this.game.getRoomById(roomId) : undefined;
        // login
        AppUtils.removeAndDisconnectUsersByIdFromGame(this.game, userId);
        const user = this.game.addUser(userId, socket);
        if (room) {
            this.joinRoom(room, user);
            this.broadcastRoomInfos();
        }

        // update
        socket.emit(SharedEmitConstants.USER_INFO, <UserInfo>{id: user.id})
        this.broadcastRoomInfos();

        // register
        socket.on("disconnect", () => {
            this.game.logoutUser(user.id);
            console.log('Got disconnected!', user.id);
            this.broadcastRoomInfos();
        });
        socket.on(SharedEmitConstants.RESPONSE, (response: string) => {
            console.log(response);
        });
        socket.on(SharedEmitConstants.CREATE_ROOM, () => {
            if (this.createRoom(user)) {
                this.broadcastRoomInfos();
            } else {
                socket.emit(SharedEmitConstants.ERROR, "You are already in a room");
            }
        });
        socket.on(SharedEmitConstants.JOIN_ROOM, (roomInfo: RoomInfo) => {
            const room = this.game.getRoomById(roomInfo.id);
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
        socket.on(SharedEmitConstants.LEAVE_ROOM, (roomInfo: RoomInfo) => {
            const room = this.game.getRoomById(roomInfo.id);
            if (room) {
                this.game.leaveRoom(room.id, user.id);
                this.broadcastRoomInfos();
            } else {
                socket.emit(SharedEmitConstants.ERROR, "You are already in a room");
            }
        });
        socket.on(SharedEmitConstants.LIST_ROOM_INFOS, () => this.broadcastRoomInfos());
    }

    private broadcastRoomInfos() {
        this.io.sockets.emit(SharedEmitConstants.LIST_ROOM_INFOS, this.game.getRoomInfos());
    }

    private createRoom(user: User): boolean {
        if (this.game.getRoomsByUserId(user.id).length !== 0) return false;
        const room: Room = {
            id: AppUtils.getRandomRoomId(this.game),
            users: [user],
        };
        this.game.addRoom(room);
        return true;
    }

    private joinRoom(room: Room, user: User): boolean {
        if (this.game.getRoomsByUserId(user.id).length !== 0) return false;
        this.game.joinRoom(room, user);
        return true;
    }

    private registerCheckers() {
        setInterval(() => {
            if (this.game.deleteExpiredRooms()) {
                this.broadcastRoomInfos();
            }
        }, 1000);
    }
}


new App()
