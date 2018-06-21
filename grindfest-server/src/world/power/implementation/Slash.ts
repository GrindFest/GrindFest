import PowerUser from "../PowerUser";
import PlayAnimation from "../scripts/PlayAnimation";
import AttackPayload from "../../combat/AttackPayload";
import {PlayEffectPayload} from "../../EffectSystem";
import {PowerAttribute, PowerTag} from "../../../infrastructure/network/Messages";
import {State, StateGenerator} from "../../../infrastructure/StateMachine";


abstract class PowerImplementation implements StateGenerator<PowerUser> {
    abstract execute(context: PowerUser): IterableIterator<State>;

    //TODO: there might be some useful methods for implementing skills
}

abstract class ComboSkill extends PowerImplementation {

}

export default class Slash extends ComboSkill { //TODO: implement combo skill, the combo logic can not be reimplemented by each skill if its shared with client


    * execute(powerUser: PowerUser) {

        let target = powerUser.target;
        let targetDirection = powerUser.targetDirection;

        //TODO: slash 3 combo if slashing after slashing
        //TODO: i could probably do this logic on client to if there would be some general attributes like PowerAttributeAnim1 and some flag telling you its combo so you'll look for other atributes like time between combos etc

        powerUser.sendMessage(new PlayEffectPayload("windSlashLarge", targetDirection));
        yield new PlayAnimation(powerUser,"spellcast", targetDirection, powerUser.getPowerAttribute(PowerTag.Slash, PowerAttribute.Duration));

        console.log("slash dir", targetDirection);
        let attack = new AttackPayload(powerUser.getPowerAttribute(PowerTag.Slash, PowerAttribute.Damage));

        attack.addTargets(powerUser.findEnemiesInArcDirection(0, -16, targetDirection, powerUser.getPowerAttribute(PowerTag.Slash, PowerAttribute.SlashArc1Length), powerUser.getPowerAttribute(PowerTag.Slash, PowerAttribute.Range)));

        powerUser.sendMessage(attack); //TODO: extract damage and duration from skill definition, it needs to be there so player will see correct tooltips



        //TODO: sendMessage could be also on component delegating it to gameObject
    }

}


