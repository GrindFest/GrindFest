import GameSystem from "../infrastructure/world/GameSystem";
import NetworkManager from "../NetworkManager";
import {ClientMovementRequest, MessageId, ServerMobileMove} from "../infrastructure/network/Messages";
import Mobile from "./Mobile";
import Client from "../Client";
import Transform from "./Transform";
import NetState from "./NetState";
import {Node2} from "../infrastructure/world/Component";



export default class MobileSystem extends GameSystem {

    mobiles: Node2<Mobile, Transform>[] = []; // [Mobile, Transform]

    netStates: NetState[] = [];

    constructor() {
        super();

        this.registerNodeJunction2(this.mobiles, Mobile, Transform);
        this.registerNodeJunction(this.netStates, NetState);

        NetworkManager.registerHandler(MessageId.CMSG_MOVE_REQUEST, this.onMoveRequest);
    }


    update(delta: number) {
        for (let mobileAndZonedAndTransform of this.mobiles) {

            let mobile = mobileAndZonedAndTransform.c1;
            let transform = mobileAndZonedAndTransform.c2;

            transform.x += mobile.velocity.x * delta;
            transform.y += mobile.velocity.y * delta;

            if (mobile.velocityDirty) {
                for (let netState of this.netStates) {
                    NetworkManager.send(netState.client, {
                        id: MessageId.SMSG_MOBILE_MOVE,
                        goId: mobile.gameObject.id,
                        movement: mobile.velocity
                    } as ServerMobileMove);
                }

                mobile.velocityDirty = false;

            }
        }
    }


    onMoveRequest(client: Client, message: ClientMovementRequest) {

        let mobile = client.hero.components.get(Mobile);
        mobile.setVelocity(message.movement);

        let transform = client.hero.components.get(Transform);
        transform.x = message.expectedPosition.x;
        transform.y = message.expectedPosition.y;

    }
}