import { Point } from "../../shared/models/point.model";
import {SketchApp} from "./sketch.app";
import p5 from "p5";
import {Turn} from "./models/turn.model";

export class SketchUtils {
    static findClosestPointIndex(points: Point[], x: number, y: number): number | undefined {
        let closestDistance: number | undefined  = undefined;
        let closestIndex: number | undefined = undefined;
        points.forEach((p, i) => {
            const d = Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2);
            if (closestDistance == null || d < closestDistance) {
                closestDistance = d;
                closestIndex = i;
            }
        });
        if (closestIndex != null) {
            if (points[closestIndex].border) return undefined;
        }
        return closestIndex;
    }

    static getTurns(app: SketchApp, p: p5): Turn[] {
        return [
            {
                name: 'Green',
                color: "#78D154",
                img: app.imgStar2,
                speech: app.imgSpeech2,
                speechPos: {
                    x: p.width / 2 - 375,
                    y: p.height / 2 + 135
                }
            },
            {
                name: 'Blue',
                color: "#4EB1E8",
                img: app.imgStar3,
                speech: app.imgSpeech1,
                speechPos: {
                    x: p.width / 2 + 390,
                    y: p.height / 2 + 275
                }
            }
        ];
    }
}
