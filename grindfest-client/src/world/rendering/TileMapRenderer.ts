import Component from "../../infrastructure/world/Component";
import {TileMapDefinition} from "../../infrastructure/definitions/TileMapDefinition";
import {TilesetDefinition} from "../../infrastructure/definitions/TilesetDefinition";
import {add, multiply, subtract, Vector2, length, interpolate} from "../../infrastructure/Math";
import {
    GroupDefinition,
    LayerDefinition,
    ObjectGroupDefinition,
    TileLayerDefinition
} from "../../infrastructure/definitions/LayerDefinition";

export default class TileMapRenderer extends Component {


    public tileMap: TileMapDefinition;
    public groupLayer: GroupDefinition;


    // @assetName name of tilemap to load
    constructor(tileMap: TileMapDefinition, groupLayer: GroupDefinition) {
        super();
        this.tileMap = tileMap;
        this.groupLayer = groupLayer;
    }


    public drawLayer(ctx: CanvasRenderingContext2D, layer: TileLayerDefinition, topLeft: Vector2, bottomRight: Vector2) {

        for (let y = Math.max(0, topLeft.y); y < Math.min(layer.height, bottomRight.y); y++) {
            for (let x = Math.max(0, topLeft.x); x < Math.min(layer.width, bottomRight.x); x++) {

                let index = x + y * layer.width;

                let globalTileId = layer.data[index];

                if (globalTileId != 0) {

                    // find correct tileset for this tileId
                    let tileset: TilesetDefinition;

                    let i = 0;
                    do {
                        tileset = this.tileMap.tilesets[i];
                        i++;
                    } while (this.tileMap.tilesets.length > i && this.tileMap.tilesets[i].firstgid <= globalTileId);


                    let tileId = globalTileId - tileset.firstgid;

                    let tileX = (tileId % ((tileset.imagewidth / tileset.tilewidth) | 0)) * tileset.tilewidth;
                    let tileY = ((tileId / ((tileset.imagewidth / tileset.tilewidth) | 0)) | 0) * tileset.tileheight;

                    ctx.drawImage(tileset.imageAsset,
                        // Source rectangle
                        tileX, tileY,
                        tileset.tilewidth, tileset.tileheight,
                        // Destination rectangle
                        x * this.tileMap.tilewidth, y * this.tileMap.tileheight,
                        this.tileMap.tilewidth, this.tileMap.tileheight);
                }


            }
        }

    }


    // checkCollision(position: Vector2): number {
    //     this.groupPositions[i]
    // }

    draw(ctx: CanvasRenderingContext2D, topLeft: { x: number; y: number }, bottomRight: { x: number; y: number }, spriteCallback: (z) => void) {


        for (let layer of this.groupLayer.layers) {
            if (layer.type == "tilelayer" && layer.visible && (layer.properties == null || !layer.properties.metadata)) { //TODO: convert properties.metadata to visible = false when loading map?
                this.drawLayer(ctx, layer as TileLayerDefinition, topLeft, bottomRight);
            }
        }


    }
}