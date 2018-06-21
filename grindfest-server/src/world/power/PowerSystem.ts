import GameSystem from "../../infrastructure/world/GameSystem";
import NetworkManager from "../../NetworkManager";
import {
    ClientPowerUse,
    MessageId,
    PowerDefinition, PowerTag,
    PowerType
} from "../../infrastructure/network/Messages";
import Client from "../../Client";
import PowerUser from "./PowerUser";
import Slash from "./implementation/Slash";
import {SlashDefinition} from "../../infrastructure/FakeData";
import StateMachine from "../../infrastructure/StateMachine";


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
                let finished = powerUser.powerStateMachine.update(dt, powerUser);
                if (finished) {
                    powerUser.currentPower = null;
                }
            }

        }
    }

    getPower(powerTag: PowerTag): PowerDefinition { //TODO: move somehwere else, load from file
        return SlashDefinition
    }

    onPowerUse(client: Client, message: ClientPowerUse) {

        let hero = client.hero;

        let powerDefinition = this.getPower(message.powerTag);

        let powerUser = hero.components.get(PowerUser);
        if (powerUser.currentPower != null) {
            return;
        }

        console.log("Using power", message.powerTag);

        let implementation = new Slash(); //TODO: get implementation from definition
        powerUser.currentPower = powerDefinition;
        powerUser.powerStateMachine = new StateMachine<PowerUser>(implementation);
        powerUser.targetDirection = message.targetDirection;
        //powerUser.targetGameObject = message.targetGameObjectId;

    }
}
