import {MessageId,} from "../../../infrastructure/network/Messages";
import PowerUser from "../PowerUser";
import {PowerScript} from "./PowerScript";
import GameObject from "../../../infrastructure/world/GameObject";
import {PlayAnimationPayload} from "../../EffectSystem";

export default class PlayAnimation extends PowerScript {
    gameObject: GameObject;
    animationTag: string;
    duration: number;
    direction: number;
    time: number = 0;

    constructor(user: PowerUser, animationTag: string, direction: number, duration: number) {
        super();
        this.gameObject = user.gameObject;
        this.animationTag = animationTag;
        this.direction = direction;
        this.duration = duration;
    }

    start() {
        this.gameObject.sendMessage(new PlayAnimationPayload(this.animationTag, this.direction, this.duration));
    }

    update(dt) {
        this.time += dt;
        if (this.time > this.duration) {
            this.isFinished = true;
        }
    }

}
