import {DataUtils} from "../shared/data.utils";
import express, {Request, Response} from 'express';
import {Express} from "express";
import path from "path";
import {Socket, Server as ServerIO} from "socket.io";
import cookieParser from "cookie-parser";
import cookie from "cookie";
import {Server} from "http";

const PORT = process.env.PORT || 3000;
const INDEX = './front/index.html';
const COOKIE_USER_ID = 'pathwise-user-id';

class App {
    app: Express;
    server: Server;
    io: ServerIO;

    constructor() {
        this.app = express();
        this.server = require('http').createServer(this.app);
        this.io = require('socket.io')(this.server);
    }


    init() {
        this.setup();
        this.registerListeners();
        this.registerBroadcastsIntervals();
    }

    private setup() {
        this.app.use(cookieParser());
    }

    private static onStartEventHandler() {
        console.log(`Listening on ${PORT}`);
    }

    private registerListeners() {
        this.server.listen(PORT, () => App.onStartEventHandler());
        this.app.get("/", this.onPageLoadEventHandler);
        this.app.use(express.static(path.join(__dirname, 'front')));
        this.io.on("connection", (socket: Socket) => {
            console.log("socket cookie", socket.handshake.headers.cookie);
            console.log("Socket connected!");
            socket.on("disconnect", () => {
                console.log('Got disconnected!');
            })
        });
    }

    private registerBroadcastsIntervals() {
        setInterval(() => {
            this.io.sockets.emit("message", "everyone");
        }, 1000)
    }

    private  onPageLoadEventHandler(request: Request, res: Response) {
        if (!request.cookies) {
            console.log("parseCookies was not used");
        } else {
            if (request.cookies.hasOwnProperty && request.cookies.hasOwnProperty(COOKIE_USER_ID)) {
                console.log("User refreshed page with cookie " + request.cookies[COOKIE_USER_ID]);
            } else {
                const userId = DataUtils.getRandomConnectionId();
                console.log("Set cookie: ", COOKIE_USER_ID, "to", userId)
                res.cookie(COOKIE_USER_ID, userId, {maxAge: 360000});
            }
            res.sendFile(INDEX, {root: __dirname});
        }
    }


}


(new App()).init();
