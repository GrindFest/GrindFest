import GameObject from "../../infrastructure/world/GameObject";
import ZoneSystem from "../zone/ZoneSystem";
import GameSystem from "../../infrastructure/world/GameSystem";
import AttackPayload from "./AttackPayload";
import DamagePayload from "./DamagePayload";
import {AttributeId, FloatingNumberType, MessageId, ServerFloatingNumber} from "../../infrastructure/network/Messages";
import GameObjectDatabase from "../GameObjectDatabase";


// instant attack and projectile are different because instant attack are instant

class DeathPayload {

}

export class CombatSystem extends GameSystem {

    get zoneSystem(): ZoneSystem {
        return this.zone.gameSystems.find( (gs) => gs instanceof ZoneSystem) as ZoneSystem;
    }

    constructor() {
        super();

        this.registerPayloadHandler(AttackPayload, this.onAttack.bind(this));
        this.registerPayloadHandler(DamagePayload, this.onDamage.bind(this));
        this.registerPayloadHandler(DeathPayload, this.onDeath.bind(this));
    }

    onDeath(gameObject: GameObject, payload: DeathPayload) {

        //TODO: death animation, something like decaytimer
        this.zone.gameObjects.remove(gameObject);

        //TODO: debug only, spawn new golem
        this.zone.gameObjects.push(GameObjectDatabase.createGameObject("golem", {zoneId: 1, x: 3*16, y:3*16}));
    }

    onDamage(gameObject: GameObject, payload: DamagePayload) {



        //TODO: something like indexer, so this code isn't ugly
        gameObject.set(AttributeId.HitPoints, Math.max(0, gameObject.get(AttributeId.HitPoints) - payload.damage));

        this.zoneSystem.broadcast({
            id: MessageId.SMSG_FLOATING_NUMBER,
            goId: gameObject.id,
            value: payload.damage,
            type: FloatingNumberType.White
        } as ServerFloatingNumber);

        if (gameObject.get(AttributeId.HitPoints) == 0) {
            // Die

            gameObject.sendMessage(new DeathPayload());

        }


    }

    onAttack(gameObject: GameObject, payload: AttackPayload) {


        for (let target of payload.targets) {
            //target.sendMessage(new DamagePayload()) //TODO: move this into onDamage

            let totalDamage = payload.damage;

            target.sendMessage(new DamagePayload(totalDamage));

        }
    }
}
