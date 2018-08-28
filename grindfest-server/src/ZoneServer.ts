import LoginManager from "./LoginManager";
import ZoneManager from "./infrastructure/world/ZoneManager";
import Zone from "./infrastructure/world/Zone";
import ZoneSystem from "./world/zone/ZoneSystem";
import MobileSystem from "./world/MobileSystem";
import NetworkManager from "./NetworkManager";
import BehaviorSystem from "./world/behavior/BehaviorSystem";
import { performance } from 'perf_hooks';
import PowerSystem from "./world/power/PowerSystem";
import EffectSystem from "./world/EffectSystem";
import GameObjectDatabase from "./world/GameObjectDatabase";
import * as http from "http";
import {CombatSystem} from "./world/combat/CombatSystem";
import {displayZonePage} from "./DebugPages";

const TIME_STEP = 1/60;

export default class ZoneServer {
    currentTime: number;
    accumulator: number = 0;


    constructor(zoneName: string) {

    }

    start() {
        console.log("GrindFest Server starting...");

        const server = http.createServer( (request, response) => {
            if (request.url == "/zone") {
                displayZonePage(response);
            } else {
                response.writeHead(404);
                response.end();

            }

        });

        server.listen(8080, (err) => {
            if (err) {
                return console.log('something bad happened', err)
            }

            console.log((new Date()) + ' Server is listening on port 8080');
        });

        GameObjectDatabase.instance.initialize();
        NetworkManager.initialize(server); //TODO: unstatic
        LoginManager.initialize();//TODO: unstatic

        let zone =  new Zone();
        zone.gameSystems.push(new ZoneSystem());
        zone.gameSystems.push(new MobileSystem());
        zone.gameSystems.push(new BehaviorSystem());
        zone.gameSystems.push(new PowerSystem());
        zone.gameSystems.push(new EffectSystem());
        zone.gameSystems.push(new CombatSystem());

        ZoneManager.zones.push(zone);


        // Push test golems
        zone.gameObjects.push(GameObjectDatabase.instance.createGameObject("golem", {zoneId: 1, x: 3*16, y:3*16}));
//        zone.gameObjects.push(GameObjectDatabase.createGameObject("golem", {zoneId: 1, x: 3*16, y:3*16}));

        this.currentTime = performance.now();
        setInterval( () => {
            this.tick()
        }, TIME_STEP*1000);
    }


    update(delta) {
        ZoneManager.update(delta);
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