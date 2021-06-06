import {io, Socket} from "socket.io-client";
import {SharedEmitConstants} from "../shared/shared.emit.constants";


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
        console.log(document.querySelector('#say-hello'));
        document.querySelector('#say-hello')?.addEventListener('click', () => {
            this.socket.emit(SharedEmitConstants.RESPONSE, {a: "jkfhksdf"});
        });
        this.displayStatus("Connecting...");
    }

    displayStatus(message: string) {
        const statusDom = document.querySelector("#connection-status");
        if (statusDom) {
            statusDom.textContent = message;
        }
        document.title = message;
    }

    registerConnectionListeners() {
        this.socket.on("connect", () => {
            console.log("connection");
            this.displayStatus("Connected!");
        });
        this.socket.on("disconnect", (message) => {
            console.log("disconnect", message);
            this.displayStatus("Disconnected :(");
        });
        this.socket.on(SharedEmitConstants.MESSAGE, (message) => {
            console.log(SharedEmitConstants.MESSAGE, message);
        });
        this.socket.on(SharedEmitConstants.ERROR, (message) => {
            console.log(SharedEmitConstants.ERROR, message);
        });
    }
}

window.addEventListener('load', () => {
    (new Client()).init();
});
