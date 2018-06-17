import NetworkManager from "./NetworkManager";
import LoginManager from "./LoginManager";
import ZoneSystem from "./world/systems/ZoneSystem";
import World from "./infrastructure/world/World";
import WorldManager from "./infrastructure/world/WorldManager";
import MobileSystem from "./world/systems/MobileSystem";
import GameObjectDatabase from "./world/GameObjectDatabase";

console.log("GrindFest Server starting...");


NetworkManager.initialize();
LoginManager.initialize();

let world =  new World();
world.gameSystems.push(new ZoneSystem());
world.gameSystems.push(new MobileSystem());

WorldManager.worlds.push(world);

world.gameObjects.push(GameObjectDatabase.createGameObject("golem", {zoneId: 1, x: 3*64, y:3*64}));

setInterval( () => {
    WorldManager.update(0);
}, 1000/15);