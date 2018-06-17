import Actor from "../../zone/Actor";
import PowerUser from "../PowerUser";
import {PowerScript} from "../scripts/PowerScript";


export interface PowerImplementation {
    execute(user: PowerUser, target: Actor, targetDirection: number): IterableIterator<PowerScript>; //TODO: should target be Actor? or something like PowerTarget?
}

