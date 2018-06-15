import GameSystem from "../../infrastructure/world/GameSystem";
import SpriteRenderer from "../components/SpriteRenderer";
import Transform from "../components/Transform";
import Mobile from "../components/Mobile";

export default class MobileSystem extends GameSystem {
    mobiles: {c1: Mobile, c2: SpriteRenderer, c3: Transform}[] = [];

    constructor() {
        super();

        this.registerNodeJunction3(this.mobiles, Mobile, SpriteRenderer, Transform);
    }

    update(delta: number) {
        for (let mobileAndSpriteAndTransform of this.mobiles) {
            let mobile = mobileAndSpriteAndTransform.c1;
            if (mobile.velocity.x != 0 || mobile.velocity.y != 0) {
                let sprite = mobileAndSpriteAndTransform.c2; //TODO: should this be here or in renderer?
                if (sprite != null) {
                    if (sprite.asset != null) { //TODO: its ugly that i have to check this everywhere
                        sprite.setAction("walk")
                    }
                }

                let transform = mobileAndSpriteAndTransform.c3;



                // TODO: extrapolate future position

                //TODO: fix speed of diagonal movement
                transform.localPosition.x += (mobile.velocity.x * mobile.speed);
                transform.localPosition.y += (mobile.velocity.y * mobile.speed);

            }
        }
    }
}
