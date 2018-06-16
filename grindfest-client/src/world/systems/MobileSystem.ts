import GameSystem from "../../infrastructure/world/GameSystem";
import SpriteRenderer from "../components/SpriteRenderer";
import Transform from "../components/Transform";
import Mobile from "../components/Mobile";
import {MessageId, ServerActorMove} from "../../infrastructure/network/Messages";
import Controllable from "../components/Controllable";
import Zoned from "../components/Zoned";
import {NetworkManager} from "../../network/NetworkManager";

export default class MobileSystem extends GameSystem {
    mobiles: { c1: Mobile, c2: SpriteRenderer, c3: Transform }[] = [];
    zoneds: { c1: Mobile, c2: Zoned }[] = [];

    constructor() {
        super();

        this.registerNodeJunction3(this.mobiles, Mobile, SpriteRenderer, Transform);
        this.registerNodeJunction2(this.zoneds, Mobile, Zoned);


        NetworkManager.registerHandler(MessageId.SMSG_ACTOR_MOVE, this.onActorMove.bind(this));
    }


    // everyone from server is controlled by interpolation and not by actions like move

    onActorMove(message: ServerActorMove) {

        //TODO: if this is my actor should i do something differently?

        let zonedAndMobile = this.zoneds.find((zoned) => zoned.c2.actorId == message.actorId);

        let mobile = zonedAndMobile.c1;

        mobile.history.push({
            position: message.position,
            velocity: message.movement
        });

        mobile.velocity = message.movement;


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
                transform.localPosition.x += (mobile.velocity.x);
                transform.localPosition.y += (mobile.velocity.y);

                let length = Math.sqrt(mobile.velocity.x * mobile.velocity.x + mobile.velocity.y * mobile.velocity.y);
                let normalizedVelocity = {x: mobile.velocity.x / length, y: mobile.velocity.y / length};

                transform.direction = Math.round((Math.atan2(mobile.velocity.y, mobile.velocity.x) + (Math.PI / 2)) / (Math.PI / 2));

            } else {

                let sprite = mobileAndSpriteAndTransform.c2; //TODO: should this be here or in renderer?
                if (sprite != null) {
                    if (sprite.asset != null) { //TODO: its ugly that i have to check this everywhere
                        sprite.stopAction("walk")
                    }
                }
            }
        }
    }
}
