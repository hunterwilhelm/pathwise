import p5 from "p5";
import {SketchApp} from "./sketch/sketch.app";
import {ClientService} from "./client/client.service";

const sketchFactory = (client: ClientService) => {
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
