import Zoned, {Zone} from "../components/Zoned";
import EnterZonePayload from "../payloads/EnterZonePayload";
import GameSystem from "../../infrastructure/world/GameSystem";
import GameObject from "../../infrastructure/world/GameObject";





export default class ZoneSystem extends GameSystem {

    zoneds: Zoned[] = [];

    debugZone: Zone;

    constructor() {
        super();


        this.debugZone = new Zone();
        this.debugZone.id = 1;

        this.registerComponent(this.zoneds, Zoned)
    }

    getZone(zoneId: number) {
        return this.debugZone;
    }

    afterGameObjectAdded(gameObject: GameObject) { //TODO: change everywhere

        //networkState.

        let zoned = gameObject.components.get(Zoned);

        zoned.zone = this.getZone(zoned.zoneId);

        if (zoned != null) {
            for (let otherZoned of this.zoneds) {

                otherZoned.gameObject.sendMessage(gameObject, new EnterZonePayload());
            }
        }

    }
}