import Component from "../../infrastructure/world/Component";

export default class InGameText extends Component {
    text: string;

    constructor(text: string) {
        super();
        this.text = text;
    }


}