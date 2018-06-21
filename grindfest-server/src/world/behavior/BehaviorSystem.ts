import GameSystem from "../../infrastructure/world/GameSystem";
import Behavior from "./Behavior";
import Mobile from "../Mobile";
import {Node3} from "../../infrastructure/world/Component";
import Transform from "../Transform";


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

            behavior.stateMachine.update(delta, behavior);

        }
    }
}
