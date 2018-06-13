// @flow

import Component from "../../infrastructure/world/Component";
import Direction from "../../game/Direction";


export default class Transform extends Component {

    scale = {x: 1, y: 1};

    localPosition = { x: 0, y: 0 };
    direction = Direction.South;

    parent = null;



    get worldPosition() {
        return {
            x: this.localPosition.x + ((this.parent == null) ? 0 : this.parent.worldPosition.x),
            y: this.localPosition.y + ((this.parent == null) ? 0 : this.parent.worldPosition.y)
        };
    }


    constructor(x = 0, y = 0) {
        super();

        this.localPosition.x = x;
        this.localPosition.y = y;
    }
}