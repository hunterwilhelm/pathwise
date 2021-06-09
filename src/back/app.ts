import express, {Express, Request, Response} from 'express';
import path from "path";
import {Server as ServerIO, Socket} from "socket.io";
import cookieParser from "cookie-parser";
import {Server} from "http";
import {AppUtils} from "./app.utils";
import {AppDataService} from "./app.data.service";
import {SharedCookieConstants} from "../shared/constants/shared.cookie.constants";
import {UserSocketService} from "./user.socket.service";

const PORT = process.env.PORT || 3000;
const INDEX = './front/index.html';

export class App {
    private readonly app: Express;
    private readonly server: Server;
    readonly io: ServerIO;
    readonly dataService: AppDataService;
    readonly socketService: UserSocketService;

    constructor() {
        this.app = express();
        this.server = require('http').createServer(this.app);
        this.io = require('socket.io')(this.server);
        this.dataService = new AppDataService();
        this.socketService = new UserSocketService(this);
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
            this.socketService.onSocketConnectionEventHandler(socket);
        });
    }

    private registerCheckers() {
        setInterval(() => {
            if (this.dataService.deleteExpiredRooms()) {
                this.socketService.broadcastRoomInfos();
            }
        }, 1000);
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
}


new App()
