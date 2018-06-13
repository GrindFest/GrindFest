import NetworkManager from "../../NetworkManager";
import NetState from "../components/NetState";
import Visual from "../components/Visual";
import Zoned from "../components/Zoned";
import EnterZonePayload from "../payloads/EnterZonePayload";
import Transform from "../components/Transform";
import GameObject from "../../infrastructure/world/GameObject";
import GameSystem from "../../infrastructure/world/GameSystem";
import {MessageId} from "../../infrastructure/network/Messages";

export default class NetworkSystem extends GameSystem {

    /*
        This will be called for every netstate and for every zoned that is in the zone with that netstate

        owner: owner of the handler
        source: source of the payload
     */
    onEnterZone(owner: GameObject, source: GameObject, payload: EnterZonePayload) {

        let netState = owner.components.get(NetState);

        let visual = source.components.get(Visual);
        let zoned = source.components.get(Zoned);
        let transform = source.components.get(Transform);

        // If this is me who is entering the zone, send me the message about who am I, and what zone I am entering
        if (owner === source) {
            NetworkManager.send(netState.client, {
                id: MessageId.SMSG_ENTER_ZONE,
                zoneId: zoned.zone.id,
                myActorId: zoned.actorId,
            });
        }


        // Send info about the other object in zone
        NetworkManager.send(netState.client, {
            id: MessageId.SMSG_ACTOR_ENTER_ZONE,
            actorId: zoned.actorId,
            spriteAsset: visual.spriteAsset,
            x: transform.x,
            y: transform.y,
            direction: transform.direction
        });


    }


    beforeGameObjectAdded(gameObject: GameObject) {

        //networkState.

        let networkState = gameObject.components.get(NetState);

        if (networkState != null) {
            gameObject.addHandler(EnterZonePayload, this.onEnterZone)
        }
    }
}

