import GameObject from "../../infrastructure/world/GameObject";
import Actor from "../zone/Actor";
import ZoneSystem from "../zone/ZoneSystem";
import GameSystem from "../../infrastructure/world/GameSystem";
import {MessageId} from "../../infrastructure/network/Messages";
import AttackPayload from "./AttackPayload";

export class CombatSystem extends GameSystem {

    zoneSystem: ZoneSystem;

    constructor() {
        super();

        this.registerPayloadHandler(AttackPayload, this.onAttack.bind(this));
    }

    onAttack(gameObject: GameObject, payload: AttackPayload) {
        //TODO: create DamagePayload

        let totalDamage = payload.damage;

        //TODO: all "business" values that needs to be synchronzied with the client has to be in AttributeContainerComponent
        //Attributes[AttributeId.Hitpoints] = Math.Max(0, Attributes[AttributeId.Hitpoints] - totalDamage);

        // this.zoneSystem.broadcast({
        //     id: MessageId.SMSG_FLOATING_NUMBER,
        //     actorId: payload.combatant.gameObject.components.get(Actor).actorId,
        //     value: totalDamage
        // });
    }
}
