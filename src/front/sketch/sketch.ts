import p5 from "p5";
import {SketchApp} from "./sketch.app";

const sketch = (p: p5) => {
    let main = new SketchApp(p);


    p.setup = function () {
        main.setup();
    };

    p.draw = function () {
        main.draw();
    };

    p.mouseClicked = function () {
        main.mouseClicked();
    }
};

export {sketch}
