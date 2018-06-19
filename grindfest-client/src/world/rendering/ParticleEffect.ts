import Component from "../../infrastructure/world/Component";
import Transform from "../Transform";
import {Vector2} from "../../infrastructure/Math";


type Color = {
    r: number;
    g: number;
    b: number;
    a: number;
}

export class FloatingTextEffect extends Component {

    velocity: Vector2;

    text: string;
    color: Color;


    constructor(text: string, color: Color, velocity: Vector2) {
        super();

        this.text = text;
        this.color = color;
        this.velocity = velocity;
    }


}