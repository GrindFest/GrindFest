import {LayerDefinition, TileLayerDefinition} from "./LayerDefinition";
import {TilesetDefinition} from "./TilesetDefinition";


export interface TileMapDefinition {
    height: number;
    width: number;
    tilewidth: number;
    tileheight: number;
    layers: LayerDefinition[];
    
    tilesets: TilesetDefinition[];
}
