


export function distance(v1: Vector2, v2: Vector2): number {
    const a = v1.x - v2.x;
    const b = v1.y - v2.y;
    return Math.sqrt( a*a + b*b );
}

export type Vector2 = {
    x: number;
    y: number;


}