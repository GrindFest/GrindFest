import GameSystem from "../infrastructure/world/GameSystem";
import NetworkManager from "../NetworkManager";
import {ClientMovementRequest, MessageId, ServerActorMove} from "../infrastructure/network/Messages";
import Actor from "./zone/Actor";
import Mobile from "./Mobile";
import Client from "../Client";
import Transform from "./Transform";
import NetState from "./NetState";



export default class MobileSystem extends GameSystem {

    mobiles: {c1: Mobile, c2: Actor, c3: Transform}[] = []; // [Mobile, Transform]

    netStates: NetState[] = [];

    constructor() {
        super();

        this.registerNodeJunction3(this.mobiles, Mobile, Actor, Transform);
        this.registerNodeJunction(this.netStates, NetState);

        NetworkManager.registerHandler(MessageId.CMSG_MOVE_REQUEST, this.onMoveRequest);
    }


    update(delta: number) {
        for (let mobileAndZonedAndTransform of this.mobiles) {

            let mobile = mobileAndZonedAndTransform.c1;
            let zoned = mobileAndZonedAndTransform.c2;
            let transform = mobileAndZonedAndTransform.c3;

            transform.x += mobile.velocity.x * delta;
            transform.y += mobile.velocity.y * delta;

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
        mobile.setVelocity(message.movement);

        let transform = client.hero.components.get(Transform);
        transform.x = message.expectedPosition.x;
        transform.y = message.expectedPosition.y;

    }
}