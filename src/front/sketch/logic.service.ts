import {SketchApp} from "./sketch.app";
import p5 from "p5";
import {Utils} from "./utils";
import {EdgeSet} from "./models/edge-set.model";
import {Point} from "./models/point.model";

export class LogicService {
    private app: SketchApp;
    private p: p5;
    
    constructor(p: p5, app: SketchApp) {
        this.app = app;
        this.p = p;
    }

    clickClosestPoint() {
        const closestIndex = Utils.findClosestPointIndex(this.app.points, this.p.mouseX, this.p.mouseY);
        if (closestIndex !== undefined) {
            this.app.points[closestIndex].color = this.app.turns[this.app.turn].color;
            this.app.points[closestIndex].img = this.app.turns[this.app.turn].img;
            this.app.points[closestIndex].turn = this.app.turn;
        }
        return closestIndex !== undefined;
    }

    switchTurn() {
        this.app.turn = (this.app.turn + 1) % this.app.turns.length;
    }

    startGame() {
        this.app.started = true;
    }


    isThereAPath(turn: number, points: Point[], edgeIndexes: EdgeSet[], borderIndexes: number[], matrix: number[][]) {
        function pathFinder(s: number, visitedIndexes: number[], endEdgeIndexes: number[]) {
            if (endEdgeIndexes.includes(s)) return true;
            const adjacents = matrix[s]
                .map((v, i) => v == 1 ? i : 0)
                .filter(v => v != 0)
                .filter(v => !borderIndexes.includes(v))
                .filter(v => !visitedIndexes.includes(v))
                .filter(v => points[v].turn == turn);

            visitedIndexes.push(s);
            for (let a of adjacents) {
                if (pathFinder(a, visitedIndexes, endEdgeIndexes)) return true;
            }
            return false;
        }

        const startEdgeIndexes = edgeIndexes[turn].start.filter(s=>points[s].turn === turn);
        const endEdgeIndexes = edgeIndexes[turn].end.filter(s=>points[s].turn === turn);

        for (let s of startEdgeIndexes) {
            let visitedIndexes: number[] = [];
            if (pathFinder(s, visitedIndexes, endEdgeIndexes)) return true;
        }

        return false;
    }

    winGame() {
        this.app.won = true;
    }

    reset() {
        this.app.setup();
    }
}
