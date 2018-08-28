import Behavior from "./Behavior";
import {State} from "../../infrastructure/StateMachine";
import {PowerTag} from "../../infrastructure/network/Messages";

export class UsePowerState extends State {
    constructor(behavior: Behavior, powerTag: PowerTag) {
        super();
    }

    start() {
    }

    update(dt: number) {
        this.isFinished = true;
    }

}