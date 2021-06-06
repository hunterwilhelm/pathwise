import express, {Express, Request, Response} from 'express';
import path from "path";
import {Server as ServerIO, Socket} from "socket.io";
import cookieParser from "cookie-parser";
import {Server} from "http";
import {AppConstants} from "./app.constants";
import {Room} from "./models/room.model";
import {SharedEmitConstants} from "../shared/shared.emit.constants";
import {AppUtils} from "./app.utils";

const PORT = process.env.PORT || 3000;
const INDEX = './front/index.html';

class App {
    app: Express;
    server: Server;
    io: ServerIO;
    rooms: Room[] = [];

    constructor() {
        this.app = express();
        this.server = require('http').createServer(this.app);
        this.io = require('socket.io')(this.server);
        const room: Room = {
            name: "hello"
        }
        this.rooms.push(room)
    }


    init() {
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
        this.io.on("connection", this.onSocketConnectionEventHandler);
    }

    private static onStartEventHandler() {
        console.log(`Listening on ${PORT}`);
    }


    private registerBroadcastsIntervals() {
        setInterval(() => {
            this.io.sockets.emit(SharedEmitConstants.MESSAGE, "everyone");
        }, 1000);
    }

    private onPageLoadEventHandler(request: Request, res: Response) {
        if (!request.cookies) {
            console.log("parseCookies was not used");
        } else {
            if (request.cookies.hasOwnProperty && request.cookies.hasOwnProperty(AppConstants.COOKIE_USER_ID)) {
                console.log("User refreshed page with cookie " + request.cookies[AppConstants.COOKIE_USER_ID]);
            } else {
                const userId = AppUtils.getRandomConnectionId();
                console.log("Set cookie: ", AppConstants.COOKIE_USER_ID, "to", userId)
                res.cookie(AppConstants.COOKIE_USER_ID, userId, {maxAge: 360000});
            }
            res.sendFile(INDEX, {root: __dirname});
        }
    }

    private onSocketConnectionEventHandler(socket: Socket) {
        const cookieData = AppUtils.getCookieFromSocket(socket, AppConstants.COOKIE_USER_ID);
        if (socket.handshake.headers.cookie != null) {
            console.log("Socket connected with cookie", cookieData);
        }
        socket.on("disconnect", () => {
            console.log('Got disconnected!');
        });
        socket.on(SharedEmitConstants.RESPONSE, (response: string) => {
            console.log(response);
        });
    }

}


(new App()).init();
