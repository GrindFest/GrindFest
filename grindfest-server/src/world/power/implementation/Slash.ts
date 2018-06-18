import PowerUser from "../PowerUser";
import PlayAnimation from "../scripts/PlayAnimation";
import {PowerScript} from "../scripts/PowerScript";
import {PowerImplementation} from "./PowerImplementation";
import GameObject from "../../../infrastructure/world/GameObject";
import {SlashDefinition} from "../../../infrastructure/FakeData";
import AttackPayload from "../../combat/AttackPayload";

export default class Slash extends PowerImplementation {

    constructor() {
        super(SlashDefinition)
    }
    * execute(user: PowerUser, target: GameObject, targetDirection: number): IterableIterator<PowerScript> {
        yield new PlayAnimation(user,"spellcast", this.powerDefinition.duration);

        let attack = new AttackPayload(50);
        attack.addTargets(user.findEnemiesInArcDirection(targetDirection, 10, 10));

        user.sendMessage(attack); //TODO: extract damage and duration from skill definition, it needs to be there so player will see correct tooltips
        //TODO: sendMessage could be also on component delegating it to gameObject
    }
}

