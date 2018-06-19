import Component from "../../infrastructure/world/Component";
import {Vector2} from "../../infrastructure/Math";
import {Direction} from "../../infrastructure/network/Messages";

export default class Mobile extends Component {

    velocity: Vector2 = {x: 0, y: 0};
    direction: Direction = Direction.Down;


    history: {
        position: Vector2,
        velocity: Vector2
    }[] = [];


}

