import GameSystem from "./GameSystem";
import GameObject from "./GameObject";
import EventEmitter from "../EventEmitter";
import {GameObjectEnterZonePayload} from "./EnterZonePayload";

class GameObjectArray extends Array<GameObject> {

    toDelete: GameObject[] = [];
    world: Zone;

    constructor(world: Zone) {
        super();
        this.world = world;

        this["pushSuper"] = this.push;
        this.push = GameObjectArray.pushOverride;
    }

    static pushOverride(...items: GameObject[]) {

        for (let gameObject of items) {
            gameObject.zone = this["world"];

            this["pushSuper"](gameObject);

            for (let child of gameObject.children) {
                this["push"](child);
            }
            this["world"].onGameObjectAdded(gameObject);

        }
        return this.length;
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
    world: Zone;

    constructor(world: Zone) {
        super();
        this.world = world;

        this["pushSuper"] = this.push;
        this.push = GameSystemArray.pushOverride;

    }

    static pushOverride(...items: GameSystem[]) {

        for (let gameSystem of items) {
            gameSystem.zone = this["world"];
            gameSystem.initialize();
        }
        return this["pushSuper"](...items);
    }

}

export default class Zone { //developers note: This is not zone

    gameSystems: GameSystemArray = new GameSystemArray(this);
    gameObjects: GameObjectArray = new GameObjectArray(this);



    getGameObjectById(id: number) {
        return this.gameObjects.find( (go) => go.id === id);
    }

    onGameObjectAdded(gameObject: GameObject) {

        //TODO: fix this, it proably makes sense, the before is registering of handlers, after is sending messages
        for (let gameSystem of this.gameSystems) {
            gameSystem.beforeGameObjectAdded(gameObject);
        }
        for (let gameSystem of this.gameSystems) {
            gameSystem.onGameObjectAdded(gameObject);
        }
        for (let otherGO of this.gameObjects) {
            otherGO.sendMessage(new GameObjectEnterZonePayload(gameObject));
            if (otherGO != gameObject) {
                gameObject.sendMessage(new GameObjectEnterZonePayload(otherGO));
            }
        }
        for (let gameSystem of this.gameSystems) {
            gameSystem.afterGameObjectAdded(gameObject);
        }
    }

    sendMessage(gameObject: GameObject, payload: any) {

        for (let gameSystem of this.gameSystems) {
            gameSystem.sendMessage(gameObject, payload);
        }

    }

    update(delta: number) {
        for (let gameObject of this.gameObjects.toDelete) {

            this.gameObjects.splice(this.gameObjects.indexOf(gameObject), 1);

            for (let gameSystem of this.gameSystems) {
                gameSystem.removeGameObject(gameObject);
            }


            // remove child from parent collection
            if (gameObject.parent != null) {
                gameObject.parent.children.splice(gameObject.parent.children.indexOf(gameObject), 1);
                gameObject.parent = null;
            }

            gameObject.zone = null;
        }
        this.gameObjects.toDelete.length = 0;
        for (let system of this.gameSystems) {
            system.update(delta);
        }
    }
}