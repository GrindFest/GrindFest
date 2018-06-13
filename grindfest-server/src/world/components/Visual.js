import Component from "../../infrastructure/world/Component";

export default class Visual extends Component {
    spriteAsset: string;

    constructor(spriteAsset: string) {
        super();
        this.spriteAsset = spriteAsset;
    }
}