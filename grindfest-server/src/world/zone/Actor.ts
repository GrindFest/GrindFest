import Component from "../../infrastructure/world/Component";
import ZoneSystem from "./ZoneSystem";


// An actor in zone, TODO: this name is not selfdescripting
export default class Actor extends Component {
    public actorId: number;
    public zone: ZoneSystem; //TODO: this seems wrong and it can be removed by using payloads everywhere and doing stuff only in systems which has access to zone system
    public zoneTag: string;

    constructor(zoneTag) {
        super();
        this.zoneTag = zoneTag;
    }

}
