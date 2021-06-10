import {Point} from "./models/point.model";
import {EdgeSet} from "./models/edge-set.model";

export class SharedGameUtils {
    static getPoints(width: number, height: number, tileWidth: number): Point[] {
        const centerX = width / 2;
        const centerY = height / 2;
        const sideLength = SharedGameUtils.sideLengthOfPolygon(tileWidth / 2, 6);
        const apothem = SharedGameUtils.apothemOfPolygon(tileWidth / 2, 6);
        const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

        const points = [];
        for (let y = 0; y < rows.length; y++) {
            for (let x = 0; x < rows[y]; x++) {
                const xx = centerX + x * (tileWidth + sideLength) * 2 - ((rows[y] - 1) * (sideLength * 3));
                const yy = centerY + y * apothem * 2 - (rows.length - 1) * apothem;
                points.push({x: xx, y: yy, border: x == 0 || x == rows[y] - 1});
            }
        }
        return points;
    }


    static sideLengthOfPolygon(radius: number, npoints: number): number{
        return 2 * radius * Math.sin(Math.PI / npoints);
    }

    static apothemOfPolygon(radius: number, npoints: number): number {
        return radius * Math.cos(Math.PI / npoints);
    }

    static getAdjacencyMatrix(points: readonly Point[], tileWidth: number): number[][] {
        let matrix: number[][] = [];
        let helperRowOfZeros = Array.from({length: points.length}, () => 0);
        helperRowOfZeros.forEach(() => {
            matrix.push(Array.from(helperRowOfZeros));
        });
        const W = Math.pow(tileWidth * 2, 2);
        points.forEach((p1: Point, i1: number) => {
            points.slice(i1 + 1).forEach((p2: Point, ii2: number) => {
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

    static getBorderIndexes(points: readonly Point[]): number[] {
        return points.reduce((filtered: number[], p: Point, i: number) => {
            if (p.border) {
                filtered.push(i);
            }
            return filtered;
        }, []);
    }

    static getEdgeIndexes(): EdgeSet[] {
        return [
            {start: [116, 112, 107, 101, 94, 86, 77, 67, 56], end: [64, 53, 43, 34, 26, 19, 13, 8, 4]},
            {start: [116, 113, 109, 104, 98, 91, 83, 74, 64], end: [56, 46, 37, 29, 22, 16, 11, 7, 4]},
        ];
    }



    static isThereAPath(turn: number, points: Point[], edgeIndexes: readonly EdgeSet[], borderIndexes: readonly number[], matrix: readonly number[][]) {
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
}
