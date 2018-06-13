import GameSystem from "./GameSystem";
import GameObject from "./GameObject";

class GameObjectArray extends Array<GameObject> {

    toDelete: GameObject[] = [];

    constructor(world: World) {
        super();
        this.world = world;

        this.pushSuper = this.push;
        this.push = GameObjectArray.pushOverride;
    }

    static pushOverride(...items: GameObject[]) {

        for (let gameObject of items) {
            gameObject.world = this.world;

            this.world.onGameObjectAdded(gameObject);

        }
        return this.pushSuper(...items);
    }

    remove(gameObject: GameObject) {
        this.toDelete.push(gameObject);

        for (let child of gameObject.children) {
            this.toDelete.push(child);
        }

    }
}

export default class World {
    gameSystems: Array<GameSystem> = [];
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
}