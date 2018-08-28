import Component from "../../infrastructure/world/Component";
import {distance, multiply, normalize, subtract, Vector2} from "../../infrastructure/Math";
import {AttributeId, PowerAttribute, PowerTag} from "../../infrastructure/network/Messages";
import GameObject from "../../infrastructure/world/GameObject";
import {
    State,
    default as StateMachine, WaitState
} from "../../infrastructure/StateMachine";
import ZoneSystem from "../zone/ZoneSystem";
import Transform from "../Transform";
import PowerUser from "../power/PowerUser";
import Combatant from "../combat/Combatant";
import Mobile from "../Mobile";
import {UsePowerState} from "./UsePowerState";
import {Brain} from "./Brain";
import {MoveNearState} from "./MoveNearState";






// class HealerBehavior {
//
//     think() {
//
//         let allies = findAllies()
//         for (let ally of allies) {
//             // if ally is low on health
//                 yield new UsePowerAction(PowerTag.Heal, ally)
//         }
//     }
// }


export default class Behavior extends Component {

    stateMachine: StateMachine<Behavior>;

    knownGameObjects: number[]; //TODO: remove on idle?


    findNearestEnemy(range: number): GameObject {
        let zoneSystem = this.gameObject.zone.gameSystems.find((gs) => gs instanceof ZoneSystem) as ZoneSystem;
        let transform = this.gameObject.components.get(Transform);
        let combatant = this.gameObject.components.get(Combatant);

        return zoneSystem.findNearestGameObject(transform.x, transform.y, range, combatant.enemyFilter)
    }

    distance(enemy: GameObject): number {
        return distance(this.gameObject.components.get(Transform), enemy.components.get(Transform));
    }

    getPowerAttribute(powerTag: PowerTag, powerAttribute: PowerAttribute): number {
        return this.gameObject.components.get(PowerUser).getPowerAttribute(powerTag, powerAttribute);
    }

    usePower(powerTag: PowerTag) {
        return new UsePowerState(this, powerTag);
    }

    moveNear(goalObject: GameObject, range: number) {
        return new MoveNearState(this, goalObject, range);
    }

    sleep(time: number) {
        return new WaitState(time);
    }

    constructor(brain: Brain) {
        super();
        this.stateMachine = new StateMachine(brain);
    }

}