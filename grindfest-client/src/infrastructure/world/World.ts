import GameSystem from "./GameSystem";
import GameObject from "./GameObject";
import EventEmitter from "../EventEmitter";

class GameObjectArray extends Array<GameObject> {

    toDelete: GameObject[] = [];
    world: World;

    constructor(world: World) {
        super();
        this.world = world;

        this["pushSuper"] = this.push;
        this.push = GameObjectArray.pushOverride;
    }

    static pushOverride(...items: GameObject[]) {

        for (let gameObject of items) {
            gameObject.world = this["world"];

            this["world"].onGameObjectAdded(gameObject);

        }
        return this["pushSuper"](...items);
    }

    remove(gameObject: GameObject) {
        this.toDelete.push(gameObject);

        for (let child of gameObject.children) {
            this.toDelete.push(child);
        }

    }
}
class GameSystemArray extends Array<GameSystem> {

    toDelete: GameSystem[] = [];
    world: World;

    constructor(world: World) {
        super();
        this.world = world;

        this["pushSuper"] = this.push;
        this.push = GameSystemArray.pushOverride;
    }

    static pushOverride(...items: GameSystem[]) {

        for (let gameSystem of items) {
            gameSystem.world = this["world"];
        }
        return this["pushSuper"](...items);
    }

}

export default class World { //developers note: This is not zone
    gameSystems: GameSystemArray = new GameSystemArray(this);
    gameObjects: GameObjectArray = new GameObjectArray(this);

    onGameObjectAdded(gameObject: GameObject) {

        //TODO: fix this, it proably makes sense, the before is registering of handlers, after is sending messages
        for (let gameSystem of this.gameSystems) {
            gameSystem.beforeGameObjectAdded(gameObject);
        }
        for (let gameSystem of this.gameSystems) {
            gameSystem.onGameObjectAdded(gameObject);
        }
        for (let gameSystem of this.gameSystems) {
            gameSystem.afterGameObjectAdded(gameObject);
        }
    }


    messageHandlers: Map<Function, EventEmitter> = new Map();

    sendMessage(gameObject: GameObject, payload: any) {

        let handlers = this.messageHandlers.get(payload.constructor);
        if (handlers != null) {
            handlers.emit2(gameObject, payload);
        }
    }
}