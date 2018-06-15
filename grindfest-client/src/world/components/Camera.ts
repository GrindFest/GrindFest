import Transform from "./Transform"
import Component from "../../infrastructure/world/Component";
import {Vector2} from "../../infrastructure/Math";

export default class Camera extends Component {

    viewport: { width: number, height: number};

    unproject(transform: Transform, position: Vector2) {

        let result = {
            x: transform.worldPosition.x + position.x - this.viewport.width / 2,
            y: transform.worldPosition.y + position.y - this.viewport.height / 2
        };

        return result;
    }
}