import p5 from "p5";
import {SketchApp} from "./sketch/sketch.app";
import {ClientService} from "./client/client.service";

const sketchFactory = (client: ClientService) => {
    /**
     * p5.js made it a function instead of a class, so here is my conversion
     */
    return (p: p5) => {
        let main = new SketchApp(p, client);

        p.setup = function () {
            main.setup();
        };

        p.draw = function () {
            main.draw();
        };
    };
};

export {sketchFactory}
