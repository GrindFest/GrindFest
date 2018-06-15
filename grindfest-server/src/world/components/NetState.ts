import Component from "../../infrastructure/world/Component";
import Client from "../../Client";

export default class NetState extends Component {
    client: Client;

    constructor(client: Client) {
        super();
        this.client = client;
    }
}