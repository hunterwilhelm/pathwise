import express, {Express, Request, Response} from 'express';
import path from "path";
import {HTTPS} from "express-sslify"
import {Server as ServerIO, Socket} from "socket.io";
import cookieParser from "cookie-parser";
import {Server} from "http";
import {AppUtils} from "./app.utils";
import {AppDataService} from "./app.data.service";
import {SharedCookieConstants} from "../shared/constants/shared.cookie.constants";
import {AppSocketService} from "./app.socket.service";

const PORT = process.env.PORT || 3000;
const INDEX = './front/index.html';

export class App {
    /**
     * Class that setups the back end
     */
    private readonly app: Express;
    private readonly server: Server;
    readonly io: ServerIO;
    readonly dataService: AppDataService;
    readonly socketService: AppSocketService;

    constructor() {
        this.app = express();
        this.server = require('http').createServer(this.app);
        this.io = require('socket.io')(this.server);
        this.dataService = new AppDataService();
        this.socketService = new AppSocketService(this);
        this.init();

    }


    init() {
        this.setup();
        this.setupRoutes();
        this.registerListeners();
        this.registerCheckers();
    }

    private setup() {
        /**
         * We need a cookie parser so we can read the
         * cookies that keep track of the user id and room id after refresh.
         */
        this.app.use(cookieParser());
    }

    private setupRoutes() {
        /**
         * Serve the public directory
         */
        // redirect to https
        if (!(process.env.NODE_ENV === 'development')) {
            this.app.use(HTTPS({ trustProtoHeader: true }));
        }
        this.app.get("/", App.onPageLoadEventHandler);
        this.app.use(express.static(path.join(__dirname, 'front')));
    }

    private registerListeners() {
        /**
         * Listen for connection and socket connection
         */
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
        }, 500);
    }

    private static onStartEventHandler() {
        console.log(`Listening on ${PORT}`);
    }


    private static onPageLoadEventHandler(request: Request, res: Response) {
        /**
         * Get cookies and send files
         */
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
