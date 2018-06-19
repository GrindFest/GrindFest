import Component from "./Component";
import Zone from "./Zone";
import AttributeContainer from "./AttributeContainer";

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

    has<T extends Component>(type: new(...args: any[]) => T): boolean {
      return this.get(type as any) != null; //TODO: typescript, what/
    }
    get<T extends Component>(type: new(...args: any[]) => T): T {
        return this.find( (c) => c.constructor === type) as T;
    }
}

export default class GameObject extends AttributeContainer {

    public id?: number;

    public zone: Zone;
    public components = new ComponentArray(this);

    // this is necessary for on screen hearts, even something like armor overlay would need this as both of those are just mobileSprites
    // but it seems to be necessary only for deleting of game objects, or should i use it as parentGo.transform?
    public parent: GameObject; //TODO: do i need this parent child hierarchy for anything? is it good for cleaning up?
    public children: Array<GameObject> = [];


    sendMessage<T>(payload: T) {
        this.zone.sendMessage(this, payload);
    }

}