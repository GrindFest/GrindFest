import Component from "../infrastructure/world/Component";


export default class Transform extends Component {
    x: number; //TODO: i should move this to AttributeContainer, see reasoning in AttributeContainer comment
    y: number;
    direction: number;

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }
}