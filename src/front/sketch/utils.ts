import { Point } from "../../shared/models/point.model";

export class Utils {
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
}
