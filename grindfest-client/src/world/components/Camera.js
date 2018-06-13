// @flow

import Transform from "./Transform"
import Component from "../../infrastructure/world/Component";

export default class Camera extends Component {

    context: CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D) {
        super();
        this.context = context;
    }


    unproject(transform: Transform, position: Vector2) {

        let result = {
            x: this.transform.worldPosition.x + position.x - this.context.canvas.width / 2,
            y: this.transform.worldPosition.y + position.y - this.context.canvas.height / 2
        };

        return result;
    }


}