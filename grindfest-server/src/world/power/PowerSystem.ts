import GameSystem from "../../infrastructure/world/GameSystem";
import NetworkManager from "../../NetworkManager";
import {
    ClientPowerUse,
    MessageId,
    PowerDefinition,
    PowerType
} from "../../infrastructure/network/Messages";
import Client from "../../Client";
import PowerUser from "./PowerUser";
import Slash from "./implementation/Slash";





export default class PowerSystem extends GameSystem {

    powerUsers: PowerUser[] = [];

    constructor() {
        super();

        this.registerNodeJunction(this.powerUsers, PowerUser);

        NetworkManager.registerHandler(MessageId.CMSG_POWER_USE, this.onPowerUse.bind(this));
    }

    update(dt) {
        for (let powerUser of this.powerUsers) {
            if (powerUser.currentPower != null) {
                if (powerUser.powerScriptIterator == null) { // no action, get next
                    powerUser.powerScriptIterator = powerUser.currentPower.execute(powerUser, powerUser.target, powerUser.targetDirection);
                }
                if (powerUser.currentPowerScript == null) {
                    let result = powerUser.powerScriptIterator.next();
                    if (result.done) {
                        powerUser.currentPower = null;
                        powerUser.currentPowerScript = null;
                    } else {
                        powerUser.currentPowerScript = result.value;
                        powerUser.currentPowerScript.start();
                    }
                }

                if (powerUser.currentPowerScript != null) {
                    powerUser.currentPowerScript.update(dt);
                    if (powerUser.currentPowerScript.isFinished) {
                        powerUser.currentPowerScript = null;
                    }
                }

            }

        }
    }

    getPower(skillTag: string): PowerDefinition { //TODO: move somehwere else, load from file
        return {
            tag: "slash",
            type:PowerType.Use,
        }
    }
    onPowerUse(client: Client, message: ClientPowerUse) {

        let hero = client.hero;

         let powerDefinition = this.getPower(message.powerTag);

         let powerUser = hero.components.get(PowerUser);
         if (powerUser.currentPower != null) {
             return;
         }

         console.log("Using power", message.powerTag);
         powerUser.currentPower = new Slash(); //TODO: get implementation from definition

    }
}
