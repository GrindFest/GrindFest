import Component from "../../infrastructure/world/Component";
import {AttributeId} from "../../infrastructure/network/Messages";


//NOTE: all "business" values that needs to be synchronzied with the client has to be in AttributeContainerComponent
export default class AttributeContainer extends Component {

    attributes: Map<AttributeId, number> = new Map();
}