import {Vector2} from "../Math";

export interface TileLayerDefinition extends LayerDefinition {
    type: "tilelayer";
    data: number[];
}

export interface GroupDefinition extends LayerDefinition {
    type: "group";
    layers: LayerDefinition[];
}

export interface ObjectDefinition {
    type: string;
    polyline: Vector2[];
}

export interface ObjectGroupDefinition extends LayerDefinition {
    type: "objectgroup";
    objects: ObjectDefinition[];
}


export interface LayerDefinition {
    name: string;
    width: number;
    height: number;
    type: "tilelayer" | "group" | "objectgroup";
    visible: boolean;
    properties: any;
}




