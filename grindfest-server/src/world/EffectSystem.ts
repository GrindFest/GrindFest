import GameSystem from "../infrastructure/world/GameSystem";
import GameObject from "../infrastructure/world/GameObject";
import {MessageId, ServerGameObjectPlayAnimation} from "../infrastructure/network/Messages";
import ZoneSystem from "./zone/ZoneSystem";

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
        this.registerPayloadHandler(PlayAnimationPayload, this.onPlayAnimationPayload.bind(this));

    }

    onPlayAnimationPayload(gameObject: GameObject, payload: PlayAnimationPayload) {
        console.log(payload.duration);
        this.zoneSystem.broadcastIfVisible(gameObject, {
            id: MessageId.SMSG_GO_PLAY_ANIMATION,
            goId: gameObject.id,
            animationTag: payload.animationTag,
            duration: payload.duration
        } as ServerGameObjectPlayAnimation);
    }
}