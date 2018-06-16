import GameSystem from "../../infrastructure/world/GameSystem";
import {NetworkManager} from "../../network/NetworkManager";
import {ClientMovementRequest, MessageId, ServerActorMove} from "../../infrastructure/network/Messages";
import Controllable, {Actions} from "../components/Controllable";
import Zoned from "../components/Zoned";
import ControllerManager from "../../ControllerManager";
import Mobile from "../components/Mobile";
import Transform from "../components/Transform";


export default class ControlsSystem extends GameSystem {

    mobiles: {c1: Controllable, c2: Mobile, c3: Transform}[] = [];

    constructor() {
        super();
        this.registerNodeJunction3(this.mobiles, Controllable, Mobile, Transform);
    }


    update() {
        let intent;



        //bind(player1, Actions.Move, controller1stickdirection)
        //bind(player1, Actions.Skill1, ButtonA)


        // Priority: Look -> Skills -> Movement
        for (let controllableAndMobile of this.mobiles) {
            //if (mobiles.owner = player1)

            if (ControllerManager.controller1ButtonA) {
              //TODO: what to do here? how to invoke skill?
            }


            let mobile = controllableAndMobile.c2;

            let newVelocity;
            if (ControllerManager.controller1Stick1Direction != null) {
                newVelocity = {
                    x: Math.cos(ControllerManager.controller1Stick1Direction) * mobile.speed,
                    y: Math.sin(ControllerManager.controller1Stick1Direction) * mobile.speed
                };
            } else {
                newVelocity = {x: 0, y: 0}
            }


            if (mobile.velocity.x != newVelocity.x || mobile.velocity.y != newVelocity.y) {

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