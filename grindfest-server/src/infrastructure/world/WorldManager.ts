import World from "./World";


export default class WorldManager {

    static worlds: World[] = [];



    static update(delta: number) {
        for (let world of WorldManager.worlds) {

            for (let gameObject of world.gameObjects.toDelete) {

                world.gameObjects.splice(world.gameObjects.indexOf(gameObject), 1);

                for (let gameSystem of world.gameSystems) {
                    gameSystem.removeGameObject(gameObject);
                }


                // remove child from parent collection
                if (gameObject.parent != null) {
                    gameObject.parent.children.splice(gameObject.parent.children.indexOf(gameObject), 1);
                    gameObject.parent = null;
                }

                gameObject.world = null;
            }
            world.gameObjects.toDelete.length = 0;

            for (let system of world.gameSystems) {
                system.update(delta);
            }

        }
    }
    static draw(delta) {
        for (let world of WorldManager.worlds) {
            for (let system of world.gameSystems) {
                system.draw(delta);
            }
        }
    }

}