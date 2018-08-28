import {Direction} from "../network/Messages";
import {Vector2} from "../Math";

export type Arc = {
    center: Vector2;
    radius: number;
    length: number;
    direction: Vector2;
}
export type Circle = {
    center: Vector2;
    radius: number;
}
export type Rectangle = {
    topLeft: Vector2;
    width:number;
    height: number;
}

export interface CollisionAreaDefinition {
    name: string;
    type: "circle" | "rectangle"
    //TODO: i could split this to rect and circle classes
    center: Vector2;
    radius: number;

    topLeft: Vector2;
    width:number;
    height: number;
}

export interface SpriteSheetDefinition {
    imageAssetName: string;
    imageAsset: HTMLImageElement;
    frameWidth: number;
    frameHeight: number;

    scale: number

    collisions: CollisionAreaDefinition[];

    actions: SpriteSheetAction[];

    actionsByName: Map<string, SpriteSheetAction>;
}

export enum WrapMode {
    Once = 0,
    Loop = 1,
    ClampForever = 2,
}

export interface SpriteSheetAction {
    name: string;
    wrapMode: WrapMode;

    animations: SpriteSheetAnimation[];

    animationsByDirection: Map<Direction, SpriteSheetAnimation>;

    height: number;
}



interface SpriteSheetAnimation {
    direction: number;
    frames: number[];
}
