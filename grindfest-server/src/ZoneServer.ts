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
import Transform from "./world/Transform";
import NetState from "./world/NetState";
import {CombatSystem} from "./world/combat/CombatSystem";

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
                response.writeHead(200, {"Content-Type":"text/html", "Refresh": "1"});


                let data = "<html><body>";
                for (let zone of ZoneManager.zones) {
                data += `<svg width='${10*16}' height='${10*16}' style="border: 1px solid black">`;


                    for (let gameObject of zone.gameObjects) {
                        let transform = gameObject.components.get(Transform);
                        let x = transform.x;
                        let y = transform.y;

                        let hasNetState = gameObject.components.has(NetState);

                        data += `<circle cx="${x}" cy="${y}" r="4" stroke="black" stroke-width="1" fill="${hasNetState?'blue' : 'red'}" />`;
                    }

                data += "</svg>";
                }

                data += "</body></html>";
                response.write(data);

                response.end();


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
        zone.gameObjects.push(GameObjectDatabase.createGameObject("golem", {zoneId: 1, x: 3*16, y:3*16}));
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