import GameSystem from "../infrastructure/world/GameSystem";
import NetworkManager from "../network/NetworkManager";
import {
    ClientMovementRequest,
    ClientPowerUse,
    MessageId,
    PowerType
} from "../infrastructure/network/Messages";
import Controllable from "./Controllable";
import ControllerManager from "../ControllerManager";
import Mobile from "./movement/Mobile";
import Transform from "./Transform";
import {multiply} from "../infrastructure/Math";
import {Node4} from "../infrastructure/world/Component";
import PowerUser from "./power/PowerUser";


export default class ControlsSystem extends GameSystem {

    mobiles: Node4<Controllable, Mobile, Transform, PowerUser>[] = [];

    constructor() {
        super();
        this.registerNodeJunction4(this.mobiles, Controllable, Mobile, Transform, PowerUser);
    }


    update() {
        let intent;


        //bind(player1, Actions.Move, controller1stickdirection)
        //bind(player1, Actions.Skill1, ButtonA)


        // Priority: Look -> Skills -> Movement
        for (let controllableAndMobile of this.mobiles) {
            //if (mobiles.owner = player1)

            let mobile = controllableAndMobile.c2;

            let preventMovement = false;
            let newVelocity;

            if (ControllerManager.controller1ButtonAPressed) {

                let powerUser = controllableAndMobile.c4;
                let power = powerUser.powerSlot1;
                if (power.type == PowerType.Use) {


                    // maybe not it might be just controller systems job to enque next attack even if i click before being able to do it
                    // that would mean that he would not do the movement

                    // should this be in power system?
                    NetworkManager.send({
                        id: MessageId.CMSG_POWER_USE,
                        powerTag: power.tag
                    } as ClientPowerUse);

                    newVelocity = {x: 0, y: 0};
                    preventMovement = true;

                }
            }


            //TODO: shouldnt this be on mobile system?
            if (!preventMovement) {

                const speed = 0.1; //TODO: this seems like a bad place, but its exact same layer and system as on server (behaviorsystem)


                if (ControllerManager.controller1Stick1Direction != null) {
                    newVelocity = multiply({
                        x: ControllerManager.controller1Stick1Direction[0],
                        y: ControllerManager.controller1Stick1Direction[1]
                    }, speed);
                } else {
                    newVelocity = {x: 0, y: 0}
                }

            }


            if (newVelocity != null && (mobile.velocity.x != newVelocity.x || mobile.velocity.y != newVelocity.y)) {

                let transform = controllableAndMobile.c3;

                NetworkManager.send({
                    id: MessageId.CMSG_MOVE_REQUEST,
                    movement: newVelocity,
                    expectedPosition: transform.localPosition
                } as ClientMovementRequest);

                mobile.velocity.x = newVelocity.x;
                mobile.velocity.y = newVelocity.y;
            }

        }


    }
}

/*

Keyboard ->
Gamepad  ->  ActionIntent -> -> Command -> *Movement*
Network  ->


ai will move to specific location, not in a direction

*/