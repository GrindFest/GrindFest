import GameSystem from "../../infrastructure/world/GameSystem";
import Behavior from "../components/Behavior";
import Mobile from "../components/Mobile";
import {Node2, Node3} from "../../infrastructure/world/Component";
import Transform from "../components/Transform";
import {distance} from "../../infrastructure/Math";


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
            if (behavior.gotoPosition == null) {
                behavior.gotoPosition.x = Math.floor(Math.random() * 10) * 64;
                behavior.gotoPosition.y = Math.floor(Math.random() * 10) * 64;
            } else {

                if (distance(transform, behavior.gotoPosition) < 5) {
                    behavior.gotoPosition = null;
                } else {

                    //TODO: maybe i shouldn't access properties of components that the system doesn't own, this could be changed by a method on mobilesystem, which would ensure you are not moving faster than you can
                    mobile.velocity.x = behavior.gotoPosition.x - transform.x;
                    mobile.velocity.y = behavior.gotoPosition.x - transform.x;
                }
            }
        }
    }
}
