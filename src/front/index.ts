import {Client} from "./client/client";
import p5 from "p5";
import {sketch} from "./sketch/sketch";

window.addEventListener('load', () => {
    new Client();
    new p5(sketch);
});
