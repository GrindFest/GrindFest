
import Component from "../../infrastructure/world/Component";
import {PowerScript} from "./scripts/PowerScript";
import {PowerImplementation} from "./implementation/PowerImplementation";
import GameObject from "../../infrastructure/world/GameObject";
import ZoneSystem from "../zone/ZoneSystem";
import Transform from "../Transform";
import Combatant from "../combat/Combatant";

//TODO: is there a difference between Combatant and PowerUser?
export default class PowerUser extends Component {
    currentPower: PowerImplementation;
    powerScriptIterator: IterableIterator<PowerScript>;
    currentPowerScript: PowerScript;

    target: GameObject;
    targetDirection: number;
    

    findEnemiesInArcDirection(direction: number, length: number, radius: number): GameObject[] {
        let zoneSystem = this.gameObject.zone.gameSystems.find( (gs) => gs instanceof ZoneSystem) as ZoneSystem;

        let transform = this.gameObject.components.get(Transform);

        const enemyFilter = (go) => {
            let combatant = go.components.get(Combatant);
            return combatant.team != this.gameObject.components.get(Combatant).team;
        };

        return Array.from(zoneSystem.findGameObjectsInArcDirection(transform.x, transform.y, direction, length, radius, enemyFilter));
        
        //TODO: i could store nodes everywhere and then index them by gameObject.id
    }
}