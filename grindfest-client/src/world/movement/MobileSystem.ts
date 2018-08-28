import GameSystem from "../../infrastructure/world/GameSystem";
import Transform from "../Transform";
import Mobile from "./Mobile";
import {Node2} from "../../infrastructure/world/Component";
import TileMapRenderer from "../rendering/TileMapRenderer";
import {GroupDefinition, TileLayerDefinition} from "../../infrastructure/definitions/LayerDefinition";
import {interpolate, length, subtract, Vector2} from "../../infrastructure/Math";
import Component from "../../infrastructure/world/Component";

export class LinearInterpolator extends Component {
    from: Vector2;
    to: Vector2;
    speed: number;

    time: number = 0;

    constructor(from: Vector2, to: Vector2, speed: number) {
        super();
        this.from = from;
        this.to = to;
        this.speed = speed;
    }


}

export default class MobileSystem extends GameSystem {
    mobiles: Node2<Mobile, Transform>[] = [];
    private tileMaps: Node2<TileMapRenderer, Transform>[] = [];
    private linearInterpolatorAndTransforms: Node2<LinearInterpolator, Transform>[] = [];

    constructor() {
        super();

        this.registerNodeJunction2(this.mobiles, Mobile, Transform);

        //TODO:  whats with the name tilemapRENDERER?
        this.registerNodeJunction2(this.tileMaps, TileMapRenderer, Transform);
        this.registerNodeJunction2(this.linearInterpolatorAndTransforms, LinearInterpolator, Transform);

    }

    updateLinearInterpolators(dt: number) {

        for (let linearInterpolatorAndTransform of this.linearInterpolatorAndTransforms) {
            let linearInterpolator = linearInterpolatorAndTransform.c1;
            let transform = linearInterpolatorAndTransform.c2;
            let position = interpolate(linearInterpolator.from, linearInterpolator.to, (Math.sin(linearInterpolator.time * linearInterpolator.speed / length(subtract(linearInterpolator.to, linearInterpolator.from))) + 1) / 2);
            transform.localPosition.x = position.x;
            transform.localPosition.y = position.y;

            linearInterpolator.time += dt;

        }
    }

    update(delta: number) {

        this.updateLinearInterpolators(delta);

        for (let mobileAndTransform of this.mobiles) {
            let mobile = mobileAndTransform.c1;

            if (mobile.velocity.x != 0 || mobile.velocity.y != 0) {

                let mobileTransform = mobileAndTransform.c2;


                // TODO: extrapolate future position

                //TODO: fix speed of diagonal movement
                let movementX = (mobile.velocity.x) * delta;
                let movementY = (mobile.velocity.y) * delta;


                //TODO: when tilemaps starts overlaping this place needs to be fixed so i will know on which tilemap the player is standing, also tilemaps have to have some sort of Z level based on their relative Z position

                //TODO: go through all the tilemaps, each has to has correct worldPosition in world
                let tileId;

                for (let tileMapAndTransform of this.tileMaps) {

                    let map = tileMapAndTransform.c1;
                    let mapTransform = tileMapAndTransform.c2;


                    let tileZ;


                    //TODO: collisions don't work on client when map asset is not loaded


                    //TODO: collision checks on different z levels


                    //TODO: i could just attach players transform to map transform and he would move with it

                    for (let layer of map.groupLayer.layers) {
                        if (layer.properties != null && layer.properties.metadata) { //TODO: always initialize properties in loader so i don't have to deal with it here?
                            let metadataLayer = layer as TileLayerDefinition;

                            let tileX = ((mobileTransform.worldPosition.x + mapTransform.worldPosition.x + movementX) / map.tileMap.tilewidth) | 0;
                            let tileY = ((mobileTransform.worldPosition.y + mapTransform.worldPosition.x + movementY) / map.tileMap.tilewidth) | 0;

                            tileId = metadataLayer.data[tileX + tileY * metadataLayer.width];
                            if (tileId != 0) {
                                break; // currently collision with only one group is allowed
                            }
                        }
                    }


                }
                if (tileId == 0) {

                    mobileTransform.localPosition.x += movementX;
                    mobileTransform.localPosition.y += movementY;
                }
            }
        }
    }
}
