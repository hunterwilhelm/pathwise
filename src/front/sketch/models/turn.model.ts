import p5, { Graphics, Image } from "p5";
import {Point} from "../../../shared/models/point.model";

export interface Turn {
    speechPos: Point;
    img: p5.Image;
    color: string;
    speech: Graphics | Image;
    name: string;
}
