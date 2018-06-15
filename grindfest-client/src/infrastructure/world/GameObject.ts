import Component from "./Component";
import World from "./World";
import EventEmitter from "../EventEmitter";

class ComponentArray extends Array<Component> {
    gameObject: GameObject;

    constructor(gameObject: GameObject){
        super();
        this.gameObject = gameObject;

        this["pushSuper"] = this.push;
        this.push = ComponentArray.pushOverride;
    }

    static pushOverride(...items: any[]) {
        for (let item of items) {
            this[item.constructor] = item;
            item.gameObject = this["gameObject"];
        }
        return this["pushSuper"](...items);
    }

    has<T extends Component>(type: (...args: any[]) => T): boolean {
      return this.get(type as any) != null; //TODO: typescript, what/
    }
    get<T extends Component>(type: new(...args: any[]) => T): T {
        return this.find( (c) => c.constructor === type) as T;
    }
}

export default class GameObject {

    public world: World;
    public components = new ComponentArray(this);

    public parent: GameObject; //TODO: do i need this parent child hierarchy for anything? is it good for cleaning up?
    public children: Array<GameObject> = [];

    messageHandlers: Map<Function, any> = new Map();

    addHandler<T>(payloadType: new(...args: any[]) => T,
                  handler: (owner: GameObject, payload: T) => void) {
        let handlers = this.messageHandlers.get(payloadType);
        if (handlers == null) {
            handlers = new EventEmitter();
            this.messageHandlers.set(payloadType, handlers);
        }

        handlers.register(handler);

    }


    sendMessage<T>(payload: T) {
        //console.log("GameObject.sendMessage", payload);
        let handlers = this.messageHandlers.get(payload.constructor);
        if (handlers != null) {
            handlers.emit3(this, payload);
        }
    }

}