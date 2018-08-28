import {Arc, Circle, Rectangle} from "./definitions/SpriteSheetDefinition";

export function pointRectangleCollides(point: Vector2, rectangle: Rectangle) {
    return point.x > rectangle.topLeft.x && point.x < rectangle.topLeft.x + rectangle.width &&
        point.y > rectangle.topLeft.y && point.y < rectangle.topLeft.y + rectangle.height;
}

export function rectangleCircleCollides(rectangle: Rectangle, circle: Circle): boolean {
    let rectangleCenterX = rectangle.topLeft.x + rectangle.width / 2;
    let rectangleCenterY = rectangle.topLeft.y + rectangle.height / 2;
    let sqDistanceBetweenCenters = Math.sqrt(distance({
        x: rectangleCenterX,
        y: rectangleCenterY
    }, circle.center));




    let outerRadius = Math.sqrt(rectangle.width * rectangle.width + rectangle.height * rectangle.height);
    if (sqDistanceBetweenCenters > Math.sqrt(outerRadius + circle.radius)) return false;

    let innerRadius = rectangle.width > rectangle.height ? rectangle.width / 2 : rectangle.height / 2;
    if (sqDistanceBetweenCenters < Math.sqrt(innerRadius + circle.radius)) return true;

    let c1c2Vect = normalize((subtract(circle.center, {x: rectangleCenterX, y: rectangleCenterY})));
    let outerPoint = add(circle.center, multiply(c1c2Vect, circle.radius));
    return pointRectangleCollides(outerPoint, rectangle);
}

export function arcRectangleCollides(arc: Arc, rectangle: Rectangle): boolean {
  //???
    return false;
}

export function arcCircleCollides(arc:Arc, circle: Circle): boolean {
    let arcDelta = subtract(arc.direction, arc.center);

    let circleDelta = subtract(circle.center, arc.center);
    if (arcDelta.x == circleDelta.x && arcDelta.y == circleDelta.y)
        return true;

    if (angle(arcDelta, circleDelta) < arc.length / 2)
        return distance(arc.center, circle.center) <= arc.radius + circle.radius;
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

export function add(v1: Vector2, v2: Vector2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y,
    }
}

export function interpolate(v1: Vector2, v2: Vector2, value: number) {
    return add(v1, multiply(subtract(v2, v1), value));
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