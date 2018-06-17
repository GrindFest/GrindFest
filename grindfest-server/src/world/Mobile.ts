import Component from "../infrastructure/world/Component";
import {Vector2} from "../infrastructure/Math";

export default class Mobile extends Component {
    velocity: Vector2 = {x: 0, y: 0};
    velocityDirty: boolean = false;

    setVelocity(velocity: Vector2) {
        this.velocityDirty = true;
        this.velocity = velocity;
    }


}