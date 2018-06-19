import GameSystem from "../../infrastructure/world/GameSystem";
import SpriteRenderer from "../rendering/SpriteRenderer";
import Transform from "../Transform";
import Mobile from "./Mobile";
import {Node2} from "../../infrastructure/world/Component";
import TileMapRenderer from "../rendering/TileMapRenderer";

export default class MobileSystem extends GameSystem {
    mobiles: Node2<Mobile, Transform>[] = [];
    private tileMaps: TileMapRenderer[] = [];

    constructor() {
        super();

        this.registerNodeJunction2(this.mobiles, Mobile, Transform);

        //TODO: i dont like that there is one tilemap and i need an array, also whats with the name tilemapRENDERER?
        this.registerNodeJunction(this.tileMaps, TileMapRenderer);

    }


    update(delta: number) {
        for (let mobileAndTransform of this.mobiles) {
            let mobile = mobileAndTransform.c1;

            if (mobile.velocity.x != 0 || mobile.velocity.y != 0) {

                let transform = mobileAndTransform.c2;


                // TODO: extrapolate future position

                //TODO: fix speed of diagonal movement
                let x = (mobile.velocity.x) * delta;
                let y = (mobile.velocity.y) * delta;

                //TODO: check for collision
                // problem is currently zone can have multiple tilemaps, which doesn't really make sense, but removing this would
                // mean that tilemap will no longer be a component?
                // or should i just always take first tilemap component i can find?

                let tileMap = this.tileMaps[0];

                // i might not have tilemap asset loaded here yet... i should not send game ready packet until i do


                let tileX = ((transform.worldPosition.x + x) / tileMap.asset.tilewidth) | 0;
                let tileY = ((transform.worldPosition.y + y) / tileMap.asset.tilewidth) | 0;
                let tileId = tileMap.asset.collisionLayer.data[tileX + tileY * tileMap.asset.collisionLayer.width];

                if (tileId == 0) {

                    transform.localPosition.x += x;
                    transform.localPosition.y += y;
                }
            }
        }
    }
}
