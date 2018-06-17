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


    sendMessage<T>(payload: T) {
        this.world.sendMessage(this, payload);
    }

}