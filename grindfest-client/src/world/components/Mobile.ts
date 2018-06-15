import Component from "../../infrastructure/world/Component";
import {Vector2} from "../../infrastructure/Math";

export default class Mobile extends Component {
    velocity: Vector2 = {x: 0, y: 0};
    history: Vector2[];

    speed: number = 5;
}
