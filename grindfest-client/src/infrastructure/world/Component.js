// @flow
import GameObject from "./GameObject";

export default class Component {

    gameObject: GameObject;

    get world() { return this.gameObject.world; }


    addHandler<T>(payloadType: Class<T>, handler: (owner: Component, source: Component, payload: T) => void) {
        this.gameObject.addHandler(payloadType, this, handler);
    }


}

