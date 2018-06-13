import NetworkManager from "./NetworkManager";
import LoginManager from "./LoginManager";
import ZoneSystem from "./world/systems/ZoneSystem";
import NetworkSystem from "./world/systems/NetworkSystem";
import World from "./infrastructure/world/World";
import WorldManager from "./infrastructure/world/WorldManager";

console.log("GrindFest Server starting...");


NetworkManager.initialize();
LoginManager.initialize();

let world = WorldManager.mainWorld = new World();
world.gameSystems.push(new ZoneSystem());
world.gameSystems.push(new NetworkSystem());

WorldManager.worlds.push(world);


setInterval( () => {
    WorldManager.update(0);
}, 1000/15);