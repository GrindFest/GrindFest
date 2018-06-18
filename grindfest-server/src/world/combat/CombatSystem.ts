import GameObject from "../../infrastructure/world/GameObject";
import ZoneSystem from "../zone/ZoneSystem";
import GameSystem from "../../infrastructure/world/GameSystem";
import AttackPayload from "./AttackPayload";
import DamagePayload from "./DamagePayload";
import Component from "../../infrastructure/world/Component";
import {AttributeId, FloatingNumberType, MessageId, ServerFloatingNumber} from "../../infrastructure/network/Messages";
import AttributeContainer from "../attributes/AttributeContainer";

export class CombatSystem extends GameSystem {

    get zoneSystem(): ZoneSystem {
        return this.zone.gameSystems.find( (gs) => gs instanceof ZoneSystem) as ZoneSystem;
    }

    constructor() {
        super();

        this.registerPayloadHandler(AttackPayload, this.onAttack.bind(this));
    }

    onAttack(gameObject: GameObject, payload: AttackPayload) {


        console.log("attacking " + payload.targets.length + " for " + payload.damage)


        for (let target of payload.targets) {
            //target.sendMessage(new DamagePayload()) //TODO: move this into onDamage

            let attributes = target.components.get(AttributeContainer);
            let totalDamage = payload.damage;

            //TODO: something like indexer, so this code isn't ugly
            // attributes[AttributeId.HitPoints] = Math.max(0, attributes[AttributeId.HitPoints] - totalDamage);

            this.zoneSystem.broadcast({
                id: MessageId.SMSG_FLOATING_NUMBER,
                goId: target.id,
                value: totalDamage,
                type: FloatingNumberType.White
            } as ServerFloatingNumber);

        }


    }
}
