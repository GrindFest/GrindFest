import GameSystem from "../../infrastructure/world/GameSystem";
import SpriteRenderer from "../rendering/SpriteRenderer";
import Transform from "../Transform";
import Mobile from "./Mobile";
import {MessageId, ServerActorMove} from "../../infrastructure/network/Messages";
import Actor from "../zone/Actor";
import NetworkManager from "../../network/NetworkManager";

export default class MobileSystem extends GameSystem {
    mobiles: { c1: Mobile, c2: SpriteRenderer, c3: Transform }[] = [];
    actors: { c1: Mobile, c2: Actor }[] = [];

    constructor() {
        super();

        this.registerNodeJunction3(this.mobiles, Mobile, SpriteRenderer, Transform);
        this.registerNodeJunction2(this.actors, Mobile, Actor);

        NetworkManager.registerHandler(MessageId.SMSG_ACTOR_MOVE, this.onActorMove.bind(this));

    }


    // everyone from server is controlled by interpolation and not by actions like move

    //@messageHandler(MessageId.SMSG_ACTOR_MOVE)
    onActorMove(message: ServerActorMove) {

        //TODO: if this is my actor should i do something differently?

        let zonedAndMobile = this.actors.find((zoned) => zoned.c2.actorId == message.actorId);

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
                transform.localPosition.x += (mobile.velocity.x) * delta;
                transform.localPosition.y += (mobile.velocity.y) * delta;

                let direction = Math.floor( ((Math.PI+Math.atan2(mobile.velocity.y, mobile.velocity.x)) / (2*Math.PI)) * 4);
                if (direction == 4) { //TODO: [-0.5, 0] returns 4
                    direction = 0;
                }
                transform.direction = Math.floor(direction);

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
