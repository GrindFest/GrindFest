import NetworkManager from "./NetworkManager";
import LoginManager from "./LoginManager";
import ZoneSystem from "./world/systems/ZoneSystem";
import World from "./infrastructure/world/World";
import WorldManager from "./infrastructure/world/WorldManager";

console.log("GrindFest Server starting...");


NetworkManager.initialize();
LoginManager.initialize();

let world =  new World();
world.gameSystems.push(new ZoneSystem());

WorldManager.worlds.push(world);


setInterval( () => {
    WorldManager.update(0);
}, 1000/15);