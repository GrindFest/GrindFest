import Component from "../../infrastructure/world/Component";
import {PowerAttribute, PowerDefinition, PowerTag, PowerType} from "../../infrastructure/network/Messages";
import {SlashDefinition} from "../../infrastructure/FakeData";


class PowerDatabase {
    static getPower(powerTag: PowerTag): PowerDefinition {
        if (powerTag === PowerTag.Slash) {
            return SlashDefinition;
        } else {
            throw "Unknown skill: " + powerTag;
        }
    }
}

export default class PowerUser extends Component {

    powerSlot1: PowerTag = PowerTag.Slash; //TODO: should this be powerdefitinion or power tag?

    getAttribute(tag: PowerTag, attribute: PowerAttribute) { //TODO: should i return 0 for unknown attributes?
        let power = PowerDatabase.getPower(tag);
        return power.attributes[attribute](this.gameObject.get);
    }
}