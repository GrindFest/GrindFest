import Component from "../../infrastructure/world/Component";
import {Vector2} from "../../infrastructure/Math";
import {Direction} from "../../infrastructure/network/Messages";

export default class Mobile extends Component {

    velocity: Vector2 = {x: 0, y: 0}; // i have to store this as rotation and speed, so i can set speed to zero but leave rotation
    direction: number = 0; // TODO: This probably shouldnt be here as many items can be non-mobile with direction


    history: {
        position: Vector2,
        velocity: Vector2
    }[] = [];


}

