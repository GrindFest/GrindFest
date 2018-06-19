import GameSystem from "../../infrastructure/world/GameSystem";
import Behavior from "./Behavior";
import Mobile from "../Mobile";
import {Node2, Node3} from "../../infrastructure/world/Component";
import Transform from "../Transform";
import {distance, normalize, multiply} from "../../infrastructure/Math";


export default class BehaviorSystem extends GameSystem {

    behaviors: Node3<Behavior, Mobile, Transform>[] = [];

    constructor() {
        super();

        this.registerNodeJunction3(this.behaviors, Behavior, Mobile, Transform);
    }

    update(delta) {
        for (let behaviorAndMobile of this.behaviors) {

            let behavior = behaviorAndMobile.c1;
            let mobile = behaviorAndMobile.c2;
            let transform = behaviorAndMobile.c3;
            if (behavior.gotoPosition == null) { //TODO: change to state machine, and status == idle
                behavior.gotoPosition = {
                    x: Math.floor(Math.random() * 5) * 16,
                    y: Math.floor(Math.random() * 5) * 16
                };

                //TODO: maybecc i shouldn't access properties of components that the system doesn't own, this could be changed by a method on mobilesystem, which would ensure you are not moving faster than you can
                // maybe not, since the speed might not be property of mobile. but its not property of behavior either, it might be property of mobile actually, but if its affected by spells it should be on something like attributecontainer?
                let velocity = normalize({
                    x: behavior.gotoPosition.x - transform.x,
                    y: behavior.gotoPosition.y - transform.y
                });

                let speed = 0.017;

                velocity = multiply(velocity, speed);

                mobile.setVelocity(velocity);

            }

            if (distance(transform, behavior.gotoPosition) < 5) {
                behavior.gotoPosition = null;
                mobile.setVelocity({
                    x: 0,
                    y: 0
                });
            }
        }
    }
}
