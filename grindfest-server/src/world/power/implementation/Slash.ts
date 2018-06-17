import Actor from "../../zone/Actor";
import PowerUser from "../PowerUser";
import PlayAnimation from "../scripts/PlayAnimation";
import {PowerScript} from "../scripts/PowerScript";
import {PowerImplementation} from "./PowerImplementation";

export default class Slash implements PowerImplementation {
    * execute(user: PowerUser, target: Actor, taregetDiretion: number): IterableIterator<PowerScript> {
        yield new PlayAnimation(user,"spellcast", 1500);

        // will slash actually have target?
        //target.gameObject.sendMessage(new AttackPayload(50)); //TODO: extract damage and duration from skill definition, it needs to be there so player will see correct tooltips
        //TODO: sendMessage could be also on component delegating it to gameObject
    }
}

