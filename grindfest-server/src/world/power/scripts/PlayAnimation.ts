import Actor from "../../zone/Actor";
import {MessageId, ServerActorPlayAnimation} from "../../../infrastructure/network/Messages";
import PowerUser from "../PowerUser";
import {PowerScript} from "./PowerScript";

export default class PlayAnimation extends PowerScript {
    actor: Actor;
    animationTag: string;
    duration: number;
    time: number = 0;

    constructor(user: PowerUser, animationTag: string, duration: number) {
        super();
        this.actor = user.gameObject.components.get(Actor);
        this.animationTag = animationTag;
        this.duration = duration;
    }

    start() {
        // broadcast the animation to near object in the zone
        //TODO: use something like EffectsSystem that will catch this, so i dont even need an actor here, or actor.zone
        //TODO: this could be payload, and some system can catch it and send it as packet
        this.actor.zone.broadcast({ //TODO: i don't like that i am creating packets so deep
            id: MessageId.SMSG_ACTOR_PLAY_ANIMATION,
            actorId: this.actor.actorId,
            animationTag: this.animationTag,
            duration: this.duration
        } as ServerActorPlayAnimation);
    }

    update(dt) {
        this.time += dt;
        if (this.time > this.duration) {
            this.isFinished = true;
        }
    }

}
