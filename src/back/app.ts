import {DataUtils} from "../shared/data.utils";
import express, {Request, Response} from 'express';
import {Express} from "express";
import {createServer} from "http";
import {Server, Socket} from "socket.io";
import path from "path";


const PORT = process.env.PORT || 3000;
const INDEX = './front/index.html';
const COOKIE_USER_ID = 'pathwise-user-id';

class App {
    app: Express;
    // server: Server;

    constructor() {
        this.app = express();
        // this.server = require('http').Server(this.app);
        this.app.listen(PORT, () => this.onStartEventHandler());
    }



    init() {
        this.registerListeners();
    }

    private onStartEventHandler() {
        console.log(`Listening on ${PORT}`);
    }

    registerListeners() {
        this.app.get("/", this.onPageLoadEventHandler);
        this.app.use(express.static(path.join(__dirname, 'front')));
    }

    onPageLoadEventHandler(request: Request, res: Response) {
        console.log("Hello");
        if (!(request.cookies?.hasOwnProperty && request.cookies.hasOwnProperty(COOKIE_USER_ID))) {
            const userId = DataUtils.getRandomConnectionId();
            console.log("Set cookie: ", COOKIE_USER_ID, "to", userId)
            res.cookie(COOKIE_USER_ID, userId, {maxAge: 360000});
        }
        res.sendFile(INDEX, {root: __dirname});
    }


}


(new App()).init();
