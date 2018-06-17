import Component from "../infrastructure/world/Component";


export default class Transform extends Component {
    x: number;
    y: number;
    direction: number;

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }
}