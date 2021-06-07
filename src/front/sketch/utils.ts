import { Point } from "./models/point.model";

export class Utils {
    static findClosestPointIndex(points: Point[], x: number, y: number): number | undefined {
        let closestDistance: number | undefined  = undefined;
        let closestIndex: number | undefined = undefined;
        points.forEach((p, i) => {
            const d = Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2);
            if (closestDistance === undefined || d < closestDistance) {
                closestDistance = d;
                closestIndex = i;
            }
        });
        if (closestIndex !== undefined) {
            if (points[closestIndex].color) return undefined;
            if (points[closestIndex].border) return undefined;
        }
        return closestIndex;
    }


// function polygon(x, y, diameter,npoints) {
//   const angle = TWO_PI / npoints;
//   beginShape();
//   for (var a = 0; a < TWO_PI; a += angle) {
//     const sx = x + cos(a) * diameter;
//     const sy = y + sin(a) * diameter;
//     vertex(sx, sy);
//   }
//   endShape(CLOSE);
// }

    static sideLengthOfPolygon(radius: number, npoints: number): number{
        return 2 * radius * Math.sin(Math.PI / npoints);
    }

    static apothemOfPolygon(radius: number, npoints: number): number {
        return radius * Math.cos(Math.PI / npoints);
    }
}
