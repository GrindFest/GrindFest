import GameObject from "../../infrastructure/world/GameObject";
import {PowerAttribute, PowerTag} from "../../infrastructure/network/Messages";
import Behavior from "./Behavior";
import {State, StateGenerator} from "../../infrastructure/StateMachine";
import {Brain} from "./Brain";



export class GolemBrain  extends Brain{


    currentTarget: GameObject;

    onSeeGameObject(go) {
        if (this.currentTarget == null) { //TODO: check if enemy
            this.currentTarget = go;
        }
    }

    onLostGameObject(go) {
        if (this.currentTarget == go) {
            this.currentTarget = null;
        }
    }

    onHit() {
        // aggro
    }

    //TODO: what to do when enemy logs out
    * execute(behavior: Behavior): IterableIterator<State> {
        if (this.currentTarget == null) { //TODO: i could rewrite this to yield FindTarget, but i would have to findtarget every loop and it would have to return same thing mostly
            console.log("searching for enemy");
            let enemy = behavior.findNearestEnemy(50);
            if (enemy == null) {
                console.log("enemy not found, going to sleep");
                yield behavior.sleep(1000); //TODO: this is not necessary when onSee is implmeneted
            } else {
                console.log("enemy found");
                this.currentTarget = enemy;
            }
        } else {
            console.log("attacking");
            //yield behavior.moveNear(this.currentTarget, behavior.getPowerAttribute(PowerTag.GolemStomp, PowerAttribute.Range));  // same thing as findtarget it just ignores movement since its already there

            //TODO these can be substates
           yield behavior.moveNear(this.currentTarget, 1);  // same thing as findtarget it just ignores movement since its already there
           yield behavior.usePower(PowerTag.GolemStomp)
        }
    }
}
