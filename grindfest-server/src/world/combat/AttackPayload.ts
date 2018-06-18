import Combatant from "./Combatant";
import GameObject from "../../infrastructure/world/GameObject";

export default class AttackPayload {
    damage: number;
    targets: GameObject[] = [];

    constructor(damage: number) { //TODO: add damageType
        this.damage = damage;
    }

    addTargets(gameObjects: GameObject[]) {
        this.targets.push(...gameObjects);
    }
}


