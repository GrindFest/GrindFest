
import Component from "../../infrastructure/world/Component";
import Actor from "../zone/Actor";
import {PowerScript} from "./scripts/PowerScript";
import {PowerImplementation} from "./implementation/PowerImplementation";

export default class PowerUser extends Component { //TODO: rename skills to powers
    currentPower: PowerImplementation;
    powerScriptIterator: IterableIterator<PowerScript>;
    currentPowerScript: PowerScript;

    target: Actor;
    targetDirection: number;
}