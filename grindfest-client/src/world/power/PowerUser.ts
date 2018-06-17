
//TODO: is this it? no more types?
import Component from "../../infrastructure/world/Component";
import {PowerDefinition, PowerType} from "../../infrastructure/network/Messages";


class PowerDatabase {
    static getPower(skillTag: string): PowerDefinition {
        if (skillTag == "slash") {
            return {
                tag: "slash",
                type: PowerType.Use,
            }
        } else {
            throw "Unknown skill: " + skillTag;
        }
    }
}

//TODO: don't i need something more general like controllable?
//what about running and using skills, and some skill requiring you to stand - are there skills that you can use when running
// or do all skills just move you when you use them

// so its something like passive skill, that you activate and then you can move
// so what does stop you when using non-channeling skill
// point is client has to know which skill stops him and which dont, or is it ok that client will have to wait for server to tell him to animate
// i need to send animation to other clients anyway, not if there is only one skilluse animation though
export default class PowerUser extends Component {

    powerSlot1: PowerDefinition = PowerDatabase.getPower("slash");
}


// public class WhirlWind extends ChannelingSkill {
//
// }
//
// public class Dash {
//     async execute() {
//         await new StartAnimation("
//         await new AoeDamageEffect();
//     }
// }
//
// public class Slash {
//
//
//     async execute() {
//         await new AoeDamageEffect();
//     }
// }