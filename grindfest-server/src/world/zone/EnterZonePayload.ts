
//TODO: this maybe just one big payloads.js file

import Actor from "./Actor";

export class ActorLeaveZonePayload {
    who: Actor;

    constructor(who: Actor) {
        this.who = who;
    }
}

export class ActorEnterZonePayload {
    who: Actor;

    constructor(who: Actor) {
        this.who = who;
    }
}

export class EnterZonePayload {
}
