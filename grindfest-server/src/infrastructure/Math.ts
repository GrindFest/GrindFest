export function multiply(v: Vector2, a: number) {
    return {x: v.x * a, y: v.y * a};
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