import GameSystem from "../../infrastructure/world/GameSystem";
import {NetworkManager} from "../../network/NetworkManager";
import {
    ClientMovementRequest,
    ClientSkillUse,
    MessageId,
    ServerActorMove,
    SkillType
} from "../../infrastructure/network/Messages";
import Controllable, {Actions} from "../components/Controllable";
import Actor from "../components/Actor";
import ControllerManager from "../../ControllerManager";
import Mobile from "../components/Mobile";
import Transform from "../components/Transform";
import {multiply} from "../../infrastructure/Math";
import {Node4} from "../../infrastructure/world/Component";
import SkillUser from "../components/SkillUser";


export default class ControlsSystem extends GameSystem {

    mobiles: Node4<Controllable, Mobile, Transform, SkillUser>[] = [];

    constructor() {
        super();
        this.registerNodeJunction4(this.mobiles, Controllable, Mobile, Transform, SkillUser);
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

                let skillUser = controllableAndMobile.c4;
                let skill = skillUser.skillSlot1;
                if (skill.type == SkillType.Use) {


                    // maybe not it might be just controller systems job to enque next attack even if i click before being able to do it
                    // that would mean that he would not do the movement

                    NetworkManager.send({
                        id: MessageId.CMSG_SKILL_USE,
                        skillTag: skill.tag
                    } as ClientSkillUse);

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