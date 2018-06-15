import GameSystem from "../../infrastructure/world/GameSystem";
import NetworkManager from "../../NetworkManager";
import {ClientMovementRequest, MessageId} from "../../infrastructure/network/Messages";
import Zoned from "../components/Zoned";
import Mobile from "../components/Mobile";
import Client from "../../Client";
import Transform from "../components/Transform";



export default class MobileSystem extends GameSystem {

    mobiles: {c1: Mobile, c2: Transform}[] = []; // [Mobile, Transform]


    constructor() {
        super();

        this.registerNodeJunction2(this.mobiles, Mobile, Transform);

        NetworkManager.registerHandler(MessageId.CMSG_MOVE_REQUEST, this.onMoveRequest);
    }


    update(delta: number) {
        for (let mobile of this.mobiles) {
         //   mobile.gameObject.components.get()
        }
    }

    onMoveRequest(client: Client, message: ClientMovementRequest) {

        let mobile = client.hero.components.get(Mobile);
        mobile.velocity.x = Math.cos(message.direction);
        mobile.velocity.y = Math.cos(message.direction);

    }
}