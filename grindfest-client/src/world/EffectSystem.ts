import GameSystem from "../infrastructure/world/GameSystem";
import NetworkManager from "../network/NetworkManager";
import {MessageId} from "../infrastructure/network/Messages";


export default class EffectSystem extends GameSystem {

    constructor() {
        super();

        NetworkManager.registerHandler(MessageId.SMSG_ACTOR_PLAY_ANIMATION, )
    }
}