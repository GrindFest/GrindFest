import LoginManager from "./LoginManager";
import WorldManager from "./infrastructure/world/WorldManager";
import GameObjectDatabase from "./world/GameObjectDatabase";
import World from "./infrastructure/world/World";
import ZoneSystem from "./world/zone/ZoneSystem";
import MobileSystem from "./world/MobileSystem";
import NetworkManager from "./NetworkManager";
import BehaviorSystem from "./world/behavior/BehaviorSystem";
import { performance } from 'perf_hooks';
import PowerSystem from "./world/power/PowerSystem";

const TIME_STEP = 1/60;

export default class ZoneServer {
    currentTime: number;
    accumulator: number = 0;


    constructor(zoneName: string) {

    }

    start() {
        console.log("GrindFest Server starting...");


        NetworkManager.initialize(); //TODO: unstatic
        LoginManager.initialize();//TODO: unstatic

        let world =  new World();
        world.gameSystems.push(new ZoneSystem());
        world.gameSystems.push(new MobileSystem());
        world.gameSystems.push(new BehaviorSystem());
        world.gameSystems.push(new PowerSystem());

        WorldManager.worlds.push(world);


        // Push test golems
//        world.gameObjects.push(GameObjectDatabase.createGameObject("golem", {zoneId: 1, x: 3*16, y:3*16}));
//        world.gameObjects.push(GameObjectDatabase.createGameObject("golem", {zoneId: 1, x: 3*16, y:3*16}));

        this.currentTime = performance.now();
        setInterval( () => {
            this.tick()
        }, TIME_STEP*1000);
    }


    update(delta) {
        WorldManager.update(delta);
    }

    tick() {

        let newTime = performance.now();
        let frameTime = newTime - this.currentTime;
        this.currentTime = newTime;

        const dt = TIME_STEP;

        this.accumulator += frameTime;

        while (this.accumulator >= dt) {
            this.update(dt);
            this.accumulator -= dt;

        }

    }

}