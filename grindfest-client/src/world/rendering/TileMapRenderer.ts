import Component from "../../infrastructure/world/Component";
import {TileMapDefinition} from "../../infrastructure/definitions/TileMapDefinition";
import {TilesetDefinition} from "../../infrastructure/definitions/TilesetDefinition";
import {Vector2} from "../../infrastructure/Math";

export default class TileMapRenderer extends Component {


    public assetName: string;
    public asset: TileMapDefinition;


    // @assetName name of tilemap to load
    constructor(assetName: string) {
        super();
        this.assetName = assetName;
    }



    public drawLayers(ctx: CanvasRenderingContext2D, from: number, to: number, topLeft: Vector2, bottomRight: Vector2) {


        for (let i = from; i < to; i++) {
            this.drawLayer(ctx, i, topLeft, bottomRight);
        }
    }

    public drawLayer(ctx: CanvasRenderingContext2D, layerIndex: number, topLeft: Vector2, bottomRight: Vector2) {

        let layer = this.asset.layers[layerIndex];

        if (layer.type != "tilelayer") // We don't want to draw objectlayers
            return;
        if (!layer.visible)
            return;


        for (let y = Math.max(0, topLeft.y); y < Math.min(layer.height, bottomRight.y); y++) {
            for (let x = Math.max(0, topLeft.x); x < Math.min(layer.width, bottomRight.x); x++) {

                let index = x + y * this.asset.width;

                let globalTileId = layer.data[index];

                if (globalTileId != 0) {

                    // find correct tileset for this tileId
                    let tileset: TilesetDefinition;

                    let i = 0;
                    do {
                        tileset = this.asset.tilesets[i];
                        i++;
                    } while (this.asset.tilesets.length > i && this.asset.tilesets[i].firstgid <= globalTileId);


                    let tileId = globalTileId - tileset.firstgid;

                    let tileX = (tileId % ((tileset.imagewidth / tileset.tilewidth) | 0)) * tileset.tilewidth;
                    let tileY = ((tileId / ((tileset.imagewidth / tileset.tilewidth) | 0)) | 0) * tileset.tileheight;

                    ctx.drawImage(tileset.imageAsset,
                    // Source rectangle
                        tileX, tileY,
                        tileset.tilewidth, tileset.tileheight,
                    // Destination rectangle
                        x * this.asset.tilewidth, y * this.asset.tileheight,
                        this.asset.tilewidth, this.asset.tileheight);
                }



            }
        }

    }
}
