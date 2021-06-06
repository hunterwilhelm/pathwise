import {io, Socket} from "socket.io-client";
import {SharedEmitConstants} from "../shared/shared.emit.constants";


class Client {
    socket: Socket;

    constructor() {
        this.socket = io();
    }

    init() {
        this.registerEventListeners();
        this.connectToServer();
    }

    registerEventListeners() {
        console.log(document.querySelector('#say-hello'));
        document.querySelector('#say-hello')?.addEventListener('click', () => {
            this.socket.emit(SharedEmitConstants.RESPONSE, {a: "jkfhksdf"});
        })
    }

    connectToServer() {
        this.socket.on(SharedEmitConstants.MESSAGE, (message) => {
        });
    }
}
window.addEventListener('load', event => {
    (new Client()).init();
});
