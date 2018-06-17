import Component from "../../infrastructure/world/Component";


// An actor in zone, TODO: this name is not selfdescripting
export default class Actor extends Component {
    public actorId: number;
    public zone: Zone;
    public zoneId: number;

    constructor(zoneId) {
        super();
        this.zoneId = zoneId;
    }

}
