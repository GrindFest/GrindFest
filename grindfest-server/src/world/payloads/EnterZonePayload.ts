
//TODO: this maybe just one big payloads.js file

import Zoned from "../components/Zoned";

export class ActorLeaveZonePayload {
    who: Zoned;

    constructor(who: Zoned) {
        this.who = who;
    }
}

export class ActorEnterZonePayload {
    who: Zoned;

    constructor(who: Zoned) {
        this.who = who;
    }
}

export class EnterZonePayload {
}
