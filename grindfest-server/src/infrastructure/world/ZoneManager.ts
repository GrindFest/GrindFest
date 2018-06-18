import Zone from "./Zone";


export default class ZoneManager { //TODO: this shouldnt be in infrastructure

    static zones: Zone[] = [];


    static update(delta: number) {
        for (let zone of ZoneManager.zones) {
            zone.update(delta);

        }
    }
    static draw(delta) {
        for (let world of ZoneManager.zones) {
            for (let system of world.gameSystems) {
                system.draw(delta);
            }
        }
    }

}