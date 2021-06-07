import express, {Express, Request, Response} from 'express';
import path from "path";
import {Server as ServerIO, Socket} from "socket.io";
import cookieParser from "cookie-parser";
import {Server} from "http";
import {SharedEmitConstants} from "../shared/constants/shared.emit.constants";
import {AppUtils} from "./app.utils";
import {GameDataService} from "./game.data.service";
import {Room} from "./models/room.model";
import {RoomInfo} from "../shared/models/room.info.model";
import {User} from "./models/user.model";
import {UserInfo} from "../shared/models/user.info.model";
import {SharedCookieConstants} from "../shared/constants/shared.cookie.constants";
import {GameLogicService} from "./game.logic.service";

const PORT = process.env.PORT || 3000;
const INDEX = './front/index.html';

class App {
    app: Express;
    server: Server;
    io: ServerIO;
    gameDataService: GameDataService;
    gameLogicService: GameLogicService;

    constructor() {
        this.app = express();
        this.server = require('http').createServer(this.app);
        this.io = require('socket.io')(this.server);
        this.gameDataService = new GameDataService();
        this.gameLogicService = new GameLogicService(this.gameDataService);
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
        const room: Room | undefined = roomId ? this.gameDataService.getRoomById(roomId) : undefined;
        // login
        AppUtils.removeAndDisconnectUsersByIdFromGame(this.gameDataService, userId);
        const user = this.gameDataService.addUser(userId, socket);
        if (room) {
            this.joinRoom(room, user);
            this.broadcastRoomInfos();
        }

        // update
        socket.emit(SharedEmitConstants.USER_INFO, <UserInfo>{id: user.id})
        this.broadcastRoomInfos();

        // register
        socket.on("disconnect", () => {
            this.gameDataService.logoutUser(user.id);
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
            const room = this.gameDataService.getRoomById(roomInfo.id);
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
            const room = this.gameDataService.getRoomById(roomInfo.id);
            if (room) {
                this.gameDataService.leaveRoom(room.id, user.id);
                this.broadcastRoomInfos();
            } else {
                socket.emit(SharedEmitConstants.ERROR, "You are already in a room");
            }
        });
        socket.on(SharedEmitConstants.ROOM_LIST_INFOS, () => this.broadcastRoomInfos());
    }

    private registerGameEvents(socket: Socket, user: User) {
        socket.on(SharedEmitConstants.GAME_MESSAGE, (message) => {
            this.gameLogicService.sendRoomMessage(user, message);
        })
    }

    private broadcastRoomInfos() {
        this.io.sockets.emit(SharedEmitConstants.ROOM_LIST_INFOS, this.gameDataService.getRoomInfos());
    }

    private createRoom(user: User): boolean {
        if (this.gameDataService.getRoomInfosByUserId(user.id).length !== 0) return false;
        const room: Room = {
            id: AppUtils.getRandomRoomId(this.gameDataService),
            users: [user],
        };
        this.gameDataService.addRoom(room);
        return true;
    }

    private joinRoom(room: Room, user: User): boolean {
        if (this.gameDataService.getRoomInfosByUserId(user.id).length !== 0) return false;
        this.gameDataService.joinRoom(room, user);
        return true;
    }

    private registerCheckers() {
        setInterval(() => {
            if (this.gameDataService.deleteExpiredRooms()) {
                this.broadcastRoomInfos();
            }
        }, 1000);
    }
}


new App()
