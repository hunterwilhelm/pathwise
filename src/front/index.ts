import {DataUtils} from "../shared/data.utils";

import {io} from "socket.io-client";

const socket = io();

socket.on("message", (message) => {
    console.log(message);
})
const randomConnectionId: string = DataUtils.getRandomConnectionId();
console.log(randomConnectionId);
