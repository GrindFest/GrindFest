import GameSystem from "../../infrastructure/world/GameSystem";
import NetworkManager from "../../NetworkManager";
import {ClientMovementRequest, MessageId, ServerActorMove} from "../../infrastructure/network/Messages";
import Zoned from "../components/Zoned";
import Mobile from "../components/Mobile";
import Client from "../../Client";
import Transform from "../components/Transform";
import NetState from "../components/NetState";



export default class MobileSystem extends GameSystem {

    mobiles: {c1: Mobile, c2: Zoned, c3: Transform}[] = []; // [Mobile, Transform]

    netStates: NetState[] = [];

    constructor() {
        super();

        this.registerNodeJunction3(this.mobiles, Mobile, Zoned, Transform);
        this.registerNodeJunction(this.netStates, NetState);

        NetworkManager.registerHandler(MessageId.CMSG_MOVE_REQUEST, this.onMoveRequest);
    }


    update(delta: number) {
        for (let mobileAndZonedAndTransform of this.mobiles) {

            let mobile = mobileAndZonedAndTransform.c1;
            let zoned = mobileAndZonedAndTransform.c2;
            let transform = mobileAndZonedAndTransform.c3;

            transform.x += mobile.velocity.x;
            transform.y += mobile.velocity.y;

            if (mobile.velocityDirty) {
                for (let netState of this.netStates) {
                    NetworkManager.send(netState.client, {
                        id: MessageId.SMSG_ACTOR_MOVE,
                        actorId: zoned.actorId,
                        movement: mobile.velocity
                    } as ServerActorMove);
                }

                mobile.velocityDirty = false;

            }
        }
    }

    onMoveRequest(client: Client, message: ClientMovementRequest) {

        let mobile = client.hero.components.get(Mobile);
        mobile.velocity = message.movement;
        mobile.velocityDirty = true;

        let transform = client.hero.components.get(Transform);
        transform.x = message.expectedPosition.x;
        transform.y = message.expectedPosition.y;

    }
}