import PowerUser from "../PowerUser";
import {PowerScript} from "../scripts/PowerScript";
import GameObject from "../../../infrastructure/world/GameObject";
import {PowerDefinition} from "../../../infrastructure/network/Messages";


export abstract class PowerImplementation {
    readonly powerDefinition: PowerDefinition;

    constructor(definition: PowerDefinition) {
        this.powerDefinition = definition;
    }

    abstract execute(user: PowerUser, target: GameObject, targetDirection: number): IterableIterator<PowerScript>; //TODO: should target be GameObject? or something like PowerTarget?
}

