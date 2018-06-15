import GameSystem from "../../infrastructure/world/GameSystem";
import {NetworkManager} from "../../network/NetworkManager";
import {ClientMovementRequest, MessageId, ServerActorMove} from "../../infrastructure/network/Messages";
import Controllable, {Actions} from "../components/Controllable";
import Zoned from "../components/Zoned";
import ControllerManager from "../../ControllerManager";
import Mobile from "../components/Mobile";


export default class ControlsSystem extends GameSystem {

    mobiles: {c1: Controllable, c2: Mobile}[] = []; //TODO: this should be [Controllable, Mobile]
    zoneds: {c1: Controllable, c2: Zoned}[] = []; //TODO: this should be something like otherControllables: Node<Controllable, Zoned>

    queuedIntents: any[] = [];

    constructor() {
        super();
        this.registerNodeJunction2(this.mobiles, Controllable, Mobile);
        this.registerNodeJunction2(this.zoneds, Controllable, Zoned);

        NetworkManager.registerHandler(MessageId.SMSG_ACTOR_MOVE, this.onActorMove);
    }


    onActorMove(message: ServerActorMove) {
        return;
        for (let controllableAndZoned of this.zoneds) {
            let zoned = controllableAndZoned.c2;
            if (message.actorId == zoned.actorId) {
                let controllable = controllableAndZoned.c1;
                this.queuedIntents.push({
                    actorId: message.actorId,
                    action: Actions.Move,

                    direction: message.direction,
                    speed: 1.0
                });
                break;
            }
        }


    }


    // everyone from server is controlled by interpolation and not by actions like move

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
            if (ControllerManager.controller1Stick1Direction != null) {
                let newVelocity = {
                    x: Math.cos(ControllerManager.controller1Stick1Direction),
                    y: Math.sin(ControllerManager.controller1Stick1Direction)
                };
                if (mobile.velocity.x != newVelocity.x || mobile.velocity.y != newVelocity.y) {

                    NetworkManager.send({
                        id: MessageId.CMSG_MOVE_REQUEST,
                        direction: ControllerManager.controller1Stick1Direction
                    } as ClientMovementRequest);

                    mobile.velocity.x = newVelocity.x;
                    mobile.velocity.y = newVelocity.y;
                }
            } else {
                mobile.velocity.x = 0;
                mobile.velocity.y = 0;
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