
import Component from "../../infrastructure/world/Component";
import GameObject from "../../infrastructure/world/GameObject";
import ZoneSystem from "../zone/ZoneSystem";
import Transform from "../Transform";
import Combatant from "../combat/Combatant";
import {PowerAttribute, PowerDefinition, PowerTag} from "../../infrastructure/network/Messages";
import {SlashDefinition} from "../../infrastructure/FakeData";
import StateMachine from "../../infrastructure/StateMachine";



//TODO: is there a difference between Combatant and PowerUser?
export default class PowerUser extends Component {
    currentPower: PowerDefinition;
    powerStateMachine: StateMachine<PowerUser>;

    target: GameObject;
    targetDirection: number;
    

    findEnemiesInArcDirection(offsetX: number, offsetY: number, direction: number, length: number, radius: number): GameObject[] {
        let zoneSystem = this.gameObject.zone.gameSystems.find( (gs) => gs instanceof ZoneSystem) as ZoneSystem;

        let transform = this.gameObject.components.get(Transform);
        let combatant = this.gameObject.components.get(Combatant);

        return Array.from(zoneSystem.findGameObjectsInArcDirection(transform.x + offsetX, transform.y + offsetY, direction, length, radius, combatant.enemyFilter));
        
        //TODO: i could store nodes everywhere and then index them by gameObject.id
    }

    getPowerAttribute(powerTag: PowerTag, powerAttribute: PowerAttribute) {

        let powerDefinition = SlashDefinition; //TODO: load from somewhere by powerTag

        return powerDefinition.attributes[powerAttribute](this.gameObject.get);
    }
}