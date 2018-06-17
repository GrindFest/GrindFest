import Component from "../../infrastructure/world/Component";


export default class Actor extends Component {

    actorId: number;

    constructor(actorId: number) {
        super();
        this.actorId = actorId;
    }

}