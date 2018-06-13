// @flow

import Component from "./Component";
import World from "./World";
import EventEmitter from "../EventEmitter";

class ComponentArray extends Array<Component> {
    gameObject: GameObject;

    constructor(gameObject: GameObject){
        super();
        this.gameObject = gameObject;

        this.pushSuper = this.push;
        this.push = ComponentArray.pushOverride;
    }

    static pushOverride(...items) {
        for (let item of items) {
            this[item.constructor] = item;
            item.gameObject = this.gameObject;
        }
        return this.pushSuper(...items);
    }

    has(type) {
      return this.get(type);
    }
    get(type: Class<Component>) {
        return this.find( (c) => c.constructor === type)
    }
}


export default class GameObject {

    world: World;
    components = new ComponentArray(this);

    parent: GameObject;
    children: Array<GameObject> = [];

    messageHandlers: Map = new Map();


    addHandler<T>(payloadType: Class<T>, handler: (owner: GameObject, source: Component, payload: T) => void) {
        let handlers = this.messageHandlers.get(payloadType);
        if (handlers == null) {
            handlers = new EventEmitter();
            this.messageHandlers.set(payloadType, handlers);
        }

        handlers.register(handler);

    }


    sendMessage(source, payload) {
        console.log("GameObject.sendMessage", payload);
        let handlers = this.messageHandlers.get(payload.constructor);
        if (handlers != null) {
            handlers.emit3(this, source, payload);
        }
    }

}