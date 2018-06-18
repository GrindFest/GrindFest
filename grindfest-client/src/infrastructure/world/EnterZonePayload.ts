
//TODO: this maybe just one big payloads.js file


import GameObject from "./GameObject";

export class GameObjectLeaveZonePayload {
    who: GameObject;

    constructor(who: GameObject) {
        this.who = who;
    }
}

export class GameObjectEnterZonePayload {
    who: GameObject;

    constructor(who: GameObject) {
        this.who = who;
    }
}

export class HeroEnterZonePayload {
}
