import Combatant from "./Combatant";

export default class AttackPayload {
    damage: number;
    constructor(damage: number, target: Combatant) { //TODO: add damageType
        this.damage = damage;
    }
}


