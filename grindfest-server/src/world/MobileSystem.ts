import GameSystem from "../infrastructure/world/GameSystem";
import NetworkManager from "../NetworkManager";
import {AttributeId, ClientMovementRequest, MessageId, ServerMobileMove} from "../infrastructure/network/Messages";
import Mobile from "./Mobile";
import Client from "../Client";
import Transform from "./Transform";
import NetState from "./NetState";
import {Node2} from "../infrastructure/world/Component";
import {multiply} from "../infrastructure/Math";
import ZoneSystem from "./zone/ZoneSystem";
import Behavior from "./behavior/Behavior";
import {GameObjectLeaveZonePayload} from "../infrastructure/world/EnterZonePayload";
import GameObject from "../infrastructure/world/GameObject";



export default class MobileSystem extends GameSystem {

    mobiles: Node2<Mobile, Transform>[] = []; // [Mobile, Transform]

    netStates: NetState[] = [];

    constructor() {
        super();

        this.registerNodeJunction2(this.mobiles, Mobile, Transform);
        this.registerNodeJunction(this.netStates, NetState);

        NetworkManager.registerHandler(MessageId.CMSG_MOVE_REQUEST, this.onMoveRequest.bind(this));
        this.registerPayloadHandler(GameObjectLeaveZonePayload, this.onGameObjectLeft.bind(this)); //TODO: why is this handler here and not on behavioral or zone system?

    }

    onGameObjectLeft(go: GameObject, payload: GameObjectLeaveZonePayload) {

        let zoneSystem = this.zone.gameSystems.find( (gs) => gs instanceof ZoneSystem) as ZoneSystem;
        let nearGameObjects = zoneSystem.findNearGameObjects(go)
        for (let gameObject of nearGameObjects) {
            let behavior = gameObject.components.get(Behavior);
            if (!behavior.knownGameObjects.has(mobile.gameObject.id)) {
                behavior.knownGameObjects.push(gameObject.id)
                behavior.onSeeGameObject(gameObject);
            }
        }
    }


    update(delta: number) {
        for (let mobileAndZonedAndTransform of this.mobiles) {

            let mobile = mobileAndZonedAndTransform.c1;
            let transform = mobileAndZonedAndTransform.c2;

            //TODO: check for collisions

            transform.x += mobile.velocity.x * delta;
            transform.y += mobile.velocity.y * delta;

            let zoneSystem = this.zone.gameSystems.find( (gs) => gs instanceof ZoneSystem) as ZoneSystem;
            let nearGameObjects = zoneSystem.findNearGameObjects(transform.gameObject)
            for (let gameObject of nearGameObjects) {
                let behavior = gameObject.components.get(Behavior);
                if (!behavior.knownGameObjects.has(mobile.gameObject.id)) {
                    behavior.knownGameObjects.push(gameObject.id)
                    behavior.onSeeGameObject(gameObject);
                }
            }



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
        mobile.setVelocity(multiply(message.movement, mobile.gameObject.get(AttributeId.MovementSpeed)));

        let transform = client.hero.components.get(Transform);
        transform.x = message.expectedPosition.x;
        transform.y = message.expectedPosition.y;

    }
}