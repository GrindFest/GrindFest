import Component from "../../infrastructure/world/Component";
import {distance, Vector2} from "../../infrastructure/Math";
import {PowerAttribute, PowerTag} from "../../infrastructure/network/Messages";
import GameObject from "../../infrastructure/world/GameObject";
import {
    State,
    StateGenerator,
    default as StateMachine, WaitState
} from "../../infrastructure/StateMachine";
import ZoneSystem from "../zone/ZoneSystem";
import Transform from "../Transform";
import PowerUser from "../power/PowerUser";
import Combatant from "../combat/Combatant";

class UsePowerState extends State {
    constructor(behavior: Behavior, powerTag: PowerTag) {
        super();
    }

    start() {
    }

    update(dt: number) {
    }

}

class MoveToState extends State {
    constructor(behavior: Behavior, goalObject: GameObject) {
        super();
    }

    start() {
    }

    update(dt: number) {
    }

}

abstract class AIBrain implements StateGenerator<Behavior> { //TODO: rename brain to something more normal


    abstract execute(context: any);
}

export class GolemBrain extends AIBrain {


    currentTarget: GameObject;

    * execute(behavior: Behavior) {
        if (this.currentTarget == null) {
            let enemy = behavior.findNearestEnemy();
            if (enemy == null) {
                yield behavior.sleep(1000);
            } else {
                this.currentTarget = enemy;
            }
        } else {
            if (behavior.distance(this.currentTarget) < behavior.getPowerAttribute(PowerTag.GolemStomp, PowerAttribute.Range)) {
                yield behavior.usePower(PowerTag.GolemStomp)
            } else {
                yield behavior.moveTo(this.currentTarget)
            }
        }
    }
}

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

    brain: AIBrain;
    stateMachine: StateMachine<Behavior>;


    findNearestEnemy(): GameObject {
        let zoneSystem = this.gameObject.zone.gameSystems.find((gs) => gs instanceof ZoneSystem) as ZoneSystem;
        let transform = this.gameObject.components.get(Transform);
        let combatant = this.gameObject.components.get(Combatant);

        return zoneSystem.findNearestGameObject(transform.x, transform.y, combatant.enemyFilter)
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

    moveTo(goalObject: GameObject) {
        return new MoveToState(this, goalObject);
    }

    sleep(time: number) {
        return new WaitState(time);
    }

    constructor(brain: AIBrain) {
        super();
        this.brain = brain;

        this.stateMachine = new StateMachine(brain);
    }

}