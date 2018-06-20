export function arcCircleCollides(arcCenter: Vector2, arcDirection: Vector2, arcRadius: number, arcLength: number, circleCenter: Vector2, circleRadius: number): boolean {
    let arcDelta = subtract(arcDirection, arcCenter);

    let circleDelta = subtract(circleCenter, arcCenter);
    if (arcDelta.x == circleDelta.x && arcDelta.y == circleDelta.y)
        return true;

    let a = angle(arcDelta, circleDelta);
    console.log(arcDirection.x, arcDirection.y);
    console.log(arcCenter.x, arcCenter.y);
    console.log(arcDelta.x, arcDelta.y);
    console.log(circleDelta.x, circleDelta.y);
    console.log(a, arcLength / 2, distance(arcCenter, circleCenter), arcRadius);
    if (a < arcLength / 2)
        return distance(arcCenter, circleCenter) <= arcRadius + circleRadius;
    else
        return false;
}

export function angle(v1: Vector2, v2: Vector2): number {
    return Math.acos(dot(v1, v2) / (length(v1) * length(v2)))
}

export function dot(v1: Vector2, v2: Vector2): number {
    return ((v1.x * v2.x) + (v1.y * v2.y));
}

export function subtract(v1: Vector2, v2: Vector2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y,
    }
}

export function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

export function randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function multiply(v: Vector2, a: number) {
    return {x: v.x * a, y: v.y * a};
}

export function length(v: Vector2) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function normalize(v: Vector2) {
    if (v.x === 0 && v.y === 0) return {x: 0, y: 0};
    const length = Math.sqrt(v.x * v.x + v.y * v.y);
    return {
        x: v.x / length,
        y: v.y / length
    }
}

export function distance(v1: Vector2, v2: Vector2): number {
    const a = v1.x - v2.x;
    const b = v1.y - v2.y;
    return Math.sqrt(a * a + b * b);
}

export type Vector2 = {
    x: number;
    y: number;


}