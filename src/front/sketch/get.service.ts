import {SketchApp} from "./sketch.app";
import p5 from "p5";
import {Utils} from "./utils";
import { Turn } from "./models/turn.model";
import {EdgeSet} from "./models/edge-set.model";
import {Point} from "./models/point.model";

export class GetService {

    private app: SketchApp;
    private p: p5;

    constructor(p: p5, app: SketchApp) {
        this.app = app;
        this.p = p;
    }

    getTurns(): Turn[] {
        return [
            {
                name: 'Green',
                color: "#78D154",
                img: this.app.imgStar2,
                speech: this.app.imgSpeech2,
                speechPos: {
                    x: this.p.width / 2 - 375,
                    y: this.p.height / 2 + 135
                }
            },
            {
                name: 'Blue',
                color: "#4EB1E8",
                img: this.app.imgStar3,
                speech: this.app.imgSpeech1,
                speechPos: {
                    x: this.p.width / 2 + 390,
                    y: this.p.height / 2 + 275
                }
            }
        ];
    }

    getPoints(): Point[] {
        const centerX = this.p.width / 2;
        const centerY = this.p.height / 2;
        const sideLength = Utils.sideLengthOfPolygon(this.app.w / 2, 6);
        const apothem = Utils.apothemOfPolygon(this.app.w / 2, 6);
        const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

        const points = [];
        for (let y = 0; y < rows.length; y++) {
            for (let x = 0; x < rows[y]; x++) {
                const xx = centerX + x * (this.app.w + sideLength) * 2 - ((rows[y] - 1) * (sideLength * 3));
                const yy = centerY + y * apothem * 2 - (rows.length - 1) * apothem;
                points.push({x: xx, y: yy, border: x == 0 || x == rows[y] - 1});
            }
        }
        return points;
    }

    getAdjacencyMatrix(): number[][] {
        let matrix: number[][] = [];
        let row = Array.from({length: this.app.points.length}, (v, i) => 0);
        row.forEach(r => {
            matrix.push(Array.from(row));
        });
        const W = Math.pow(this.app.w * 2, 2);
        this.app.points.forEach((p1: Point, i1: number) => {
            this.app.points.slice(i1 + 1).forEach((p2: Point, ii2: number) => {
                const i2 = i1 + 1 + ii2;
                const D = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
                if (Math.abs(D - W) < 1000) {
                    matrix[i2][i1] = 1;
                    matrix[i1][i2] = 1;
                }
            });
        });
        return matrix;
    }

    getBorderIndexes(): number[] {
        return this.app.points.reduce((filtered: number[], p: Point, i: number) => {
            if (p.border) {
                filtered.push(i);
            }
            return filtered;
        }, []);
    }

    getEdgeIndexes(): EdgeSet[] {
        return [
            {start: [116, 112, 107, 101, 94, 86, 77, 67, 56], end: [64, 53, 43, 34, 26, 19, 13, 8, 4]},
            {start: [116, 113, 109, 104, 98, 91, 83, 74, 64], end: [56, 46, 37, 29, 22, 16, 11, 7, 4]},
        ];

    }
}
