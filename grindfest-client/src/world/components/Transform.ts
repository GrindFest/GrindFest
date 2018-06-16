import Component from "../../infrastructure/world/Component";
import {Direction} from "../../infrastructure/network/Messages";
import {Vector2} from "../../infrastructure/Math";


export default class Transform extends Component {

    scale: Vector2 = {x: 1, y: 1};

    localPosition: Vector2 = { x: 0, y: 0 };
    direction: Direction = Direction.Down; //TODO: shouldn't this be somewhere else?

    parent: Transform = null;



    get worldPosition(): Vector2 {
        return {
            x: this.localPosition.x + ((this.parent == null) ? 0 : this.parent.worldPosition.x),
            y: this.localPosition.y + ((this.parent == null) ? 0 : this.parent.worldPosition.y)
        };
    }


    constructor(x = 0, y = 0, parent?: Transform) {
        super();

        this.localPosition.x = x;
        this.localPosition.y = y;
        this.parent = parent;
    }
}