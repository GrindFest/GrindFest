import GameSystem from "../infrastructure/world/GameSystem";
import GameObject from "../infrastructure/world/GameObject";
import {MessageId, ServerGameObjectPlayAnimation, ServerGameObjectPlayEffect} from "../infrastructure/network/Messages";
import ZoneSystem from "./zone/ZoneSystem";

export class PlayEffectPayload {
    effectTag: string;
    direction: number;

    constructor(effectTag: string, direction: number) {
        this.effectTag = effectTag;
        this.direction = direction;
    }

}
export class PlayAnimationPayload {
    constructor(animationTag: string, duration: number) {
        this.animationTag = animationTag;
        this.duration = duration;

    }

    animationTag: string;
    duration: number;
}

export default class EffectSystem extends GameSystem {

    zoneSystem: ZoneSystem;

    constructor() {
        super();

    }

    initialize() {
        this.zoneSystem = this.zone.gameSystems.find( gs => gs instanceof ZoneSystem) as ZoneSystem;
        this.registerPayloadHandler(PlayAnimationPayload, this.onPlayAnimation.bind(this));
        this.registerPayloadHandler(PlayEffectPayload, this.onPlayEffect.bind(this));

    }

    onPlayEffect(gameObject: GameObject, payload: PlayEffectPayload) {

        this.zoneSystem.broadcastIfVisible(gameObject, {
            id: MessageId.SMSG_GO_PLAY_EFFECT,
            goId: gameObject.id,
            effectTag: payload.effectTag,
            direction: payload.direction
        } as ServerGameObjectPlayEffect);
    }

    onPlayAnimation(gameObject: GameObject, payload: PlayAnimationPayload) {
        this.zoneSystem.broadcastIfVisible(gameObject, {
            id: MessageId.SMSG_GO_PLAY_ANIMATION,
            goId: gameObject.id,
            animationTag: payload.animationTag,
            duration: payload.duration
        } as ServerGameObjectPlayAnimation);
    }
}