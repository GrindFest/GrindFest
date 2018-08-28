import Zone from "./Zone";
import Component, {Node, Node2, Node3, Node4} from "./Component";
import GameObject from "./GameObject";
import EventEmitter from "../EventEmitter";
import {GameObjectLeaveZonePayload} from "./EnterZonePayload";

export default abstract class GameSystem {

    zone: Zone;
    messageHandlers: Map<Function, EventEmitter> = new Map();
    private registeredNodes: Map<Function[], Node[]> = new Map();

    findGameObjectById(id: number): GameObject { //TODO: should this throw exception if i can't find the game object?
        if (id == null) throw "invalid argument id null";
        return this.zone.gameObjects.find((go) => go.id === id);
    }

    initialize() {

    }

    update(delta: number) {

    }

    draw(delta: number) {

    }

    onGameObjectAdded(gameObject: GameObject): void {

        for (let [componentTypes, nodeArray] of this.registeredNodes.entries()) {
            let match = true;
            let components = [];
            for (let componentType of componentTypes) {
                let component = gameObject.components.get(componentType as any);
                if (component == null) {
                    match = false;
                    break;
                } else {
                    components.push(component);
                }
            }
            if (match) {
                let node: Node;
                if (componentTypes.length == 1) {
                    node = components[0]
                } else if (componentTypes.length == 2) {
                    node = {
                        gameObject: gameObject,
                        c1: components[0],
                        c2: components[1],
                    } as Node2<any, any>;
                } else if (componentTypes.length == 3) {
                    node = {
                        gameObject: gameObject,
                        c1: components[0],
                        c2: components[1],
                        c3: components[2],
                    } as Node3<any, any, any>;
                } else if (componentTypes.length == 4) {
                    node = {
                        gameObject: gameObject,
                        c1: components[0],
                        c2: components[1],
                        c3: components[2],
                        c4: components[3],
                    } as Node4<any, any, any, any>;
                } else {
                    throw "Unsupported component amount " + componentTypes.length;
                }

                nodeArray.push(node);
            }
        }

        // for (let component of gameObject.components) {
        //     let componentType = component.constructor;
        //
        //     let nodeArray = this.registeredComponents.get(componentType);
        //     if (nodeArray != null) {
        //         nodeArray.push(component);
        //     }
        // }
    }

    beforeGameObjectAdded(gameObject: GameObject) {

    }

    afterGameObjectAdded(gameObject: GameObject) {

    }

    afterGameObjectRemoved(gameObject: GameObject) {

    }

    removeGameObject(gameObject: GameObject): void {

        for (let [componentTypes, nodeArray] of this.registeredNodes.entries()) {

            let index = nodeArray.findIndex((c) => c.gameObject == gameObject);
            if (index !== -1) {
                nodeArray.splice(index, 1);
            }
        }

        // why isnt this in zone class?
        for (let otherGO of this.zone.gameObjects) {
            otherGO.sendMessage(new GameObjectLeaveZonePayload(gameObject));
        }


        this.afterGameObjectRemoved(gameObject);
    }


    //TODO: there are ways to make the array look nice like {sprite: T1, transform: T2}[] or even {T1 & T2}[], but it will probably have performance cost
    protected registerNodeJunction<T extends Component>(array: T[], componentType: new(...args: any[]) => T) {
        if (array == null) { //TODO: this might be implemented as @notNull decorator
            throw "Node junction target array can't be null";
        }
        this.registeredNodes.set([componentType], array);
    }


    protected registerNodeJunction2<T1 extends Component, T2 extends Component>(array: Node2<T1, T2>[], component1Type: new(...args: any[]) => T1, component2Type: new(...args: any[]) => T2) {
        if (array == null) {
            throw "Node junction target array can't be null";
        }
        this.registeredNodes.set([component1Type, component2Type], array);
    }

    protected registerNodeJunction3<T1 extends Component, T2 extends Component, T3 extends Component>(array: Node3<T1, T2, T3>[], component1Type: new(...args: any[]) => T1, component2Type: new(...args: any[]) => T2, component3Type: new(...args: any[]) => T3) {
        if (array == null) {
            throw "Node junction target array can't be null";
        }
        this.registeredNodes.set([component1Type, component2Type, component3Type], array);
    }

    protected registerNodeJunction4<T1 extends Component, T2 extends Component, T3 extends Component, T4 extends Component>(array: Node3<T1, T2, T3>[], component1Type: new(...args: any[]) => T1, component2Type: new(...args: any[]) => T2, component3Type: new(...args: any[]) => T3, component4Type: new(...args: any[]) => T4) {
        if (array == null) {
            throw "Node junction target array can't be null";
        }
        this.registeredNodes.set([component1Type, component2Type, component3Type, component4Type], array);
    }



    sendMessage(gameObject: GameObject, payload: any) {

        let handlers = this.messageHandlers.get(payload.constructor);
        if (handlers != null) {
            handlers.emit2(gameObject, payload);
        }
    }

    registerPayloadHandler<T>(payloadType: new(...args: any[]) => T,
                              handler: (owner: GameObject, payload: T) => void) {
        let handlers = this.messageHandlers.get(payloadType);
        if (handlers == null) {
            handlers = new EventEmitter();
            this.messageHandlers.set(payloadType, handlers);
        }

        handlers.register(handler);

    }

}
