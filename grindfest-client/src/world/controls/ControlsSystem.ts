import GameSystem from "../../infrastructure/world/GameSystem";
import NetworkManager from "../../network/NetworkManager";
import {
    ClientMovementRequest,
    ClientPowerUse,
    MessageId,
    PowerType, ServerGameObjectPlayAnimation, ServerMobileMove
} from "../../infrastructure/network/Messages";
import Controllable, {Actions} from "./Controllable";
import ControllerManager from "../../ControllerManager";
import Mobile from "../movement/Mobile";
import Transform from "../Transform";
import {multiply, Vector2, length} from "../../infrastructure/Math";
import {Node4} from "../../infrastructure/world/Component";
import PowerUser from "../power/PowerUser";
import SpriteRenderer from "../rendering/SpriteRenderer";


export default class ControlsSystem extends GameSystem {

    mobiles: Node4<Controllable, Mobile, Transform, PowerUser>[] = [];

    constructor() {
        super();
        this.registerNodeJunction4(this.mobiles, Controllable, Mobile, Transform, PowerUser);

        NetworkManager.registerHandler(MessageId.SMSG_GO_PLAY_ANIMATION, this.onActorPlayAnimation.bind(this));
        NetworkManager.registerHandler(MessageId.SMSG_MOBILE_MOVE, this.onActorMove.bind(this));

    }

    // everyone from server is controlled by interpolation and not by actions like move

    //@messageHandler(MessageId.SMSG_MOBILE_MOVE)
    onActorMove(message: ServerMobileMove) {

        //TODO: if this is my actor should i do something differently?

        let go = this.findGameObjectById(message.goId);

        let mobile = go.components.get(Mobile);
        let controllable = go.components.get(Controllable);

        mobile.history.push({
            position: message.position,
            velocity: message.movement
        });

        if (!controllable.isLocal) {
            if (message.movement.x == 0 && message.movement.y == 0) {
                this.stopMoving(controllable)
            } else {
                this.startMoving(controllable, message.movement)
            }
        }
    }


    onActorPlayAnimation(message: ServerGameObjectPlayAnimation) {
        let go = this.findGameObjectById(message.goId);
        let controllable = go.components.get(Controllable);

        //TODO: should i pass override = true when server says to do it?

        this.startAnimation(controllable, message.animationTag, message.duration);
    }

    update(dt) {

        //bind(player1, Actions.Move, controller1stickdirection)
        //bind(player1, Actions.Skill1, ButtonA)


        // Priority: Look -> Skills -> Movement
        for (let controllableAndMobile of this.mobiles) {

            let controllable = controllableAndMobile.c1;
            let mobile = controllableAndMobile.c2;

            if (controllable.state == null) {
                this.startIdle(controllable);
            }

            if (!controllable.isLocal)
                continue;


            if (controllable.state >= Actions.PlayingAnimation)
                continue;

            if (ControllerManager.controller1ButtonAPressed) {

                let powerUser = controllableAndMobile.c4;
                let power = powerUser.powerSlot1;

                // should this be in power system?
                NetworkManager.send({
                    id: MessageId.CMSG_POWER_USE,
                    powerTag: power.tag
                } as ClientPowerUse);

                if (power.type == PowerType.Use) {
                    // maybe not it might be just controller systems job to enque next attack even if i click before being able to do it
                    // that would mean that he would not do the movement
                    this.startAnimation(controllable, power.animationTag, power.duration);
                }
            }

            if (controllable.state >= Actions.PlayingAnimation)
                continue;

            const speed = 0.1; //TODO: this seems like a bad place, but its exact same layer and system as on server (behaviorsystem)

            let newVelocity;
            if (ControllerManager.controller1Stick1Direction != null) {
                newVelocity = multiply({
                    x: ControllerManager.controller1Stick1Direction[0],
                    y: ControllerManager.controller1Stick1Direction[1]
                }, speed);
            } else {
                newVelocity = {x: 0, y: 0}

            }

            if (mobile.velocity.x != newVelocity.x || mobile.velocity.y != newVelocity.y) {

                console.log(newVelocity);
                if (newVelocity.x == 0 && newVelocity.y == 0) {
                    this.stopMoving(controllable)
                } else {
                    this.startMoving(controllable, newVelocity);
                }
            }

        }

        for (let controllableAndMobile of this.mobiles) {
            let controllable = controllableAndMobile.c1;

            if (controllable.state == Actions.PlayingAnimation) {
                this.updateAnimation(controllable, dt);
            }
            if (controllable.state == Actions.Move) {
                this.updateMoving(controllable, dt);
            }
            if (controllable.state == Actions.Idle) {
                this.updateIdle(controllable, dt);
            }
        }
    }

    startMoving(controllable: Controllable, velocity: Vector2) {
        let transform = controllable.gameObject.components.get(Transform);
        let mobile = controllable.gameObject.components.get(Mobile);
        let spriteRenderer = controllable.gameObject.components.get(SpriteRenderer);

        let speed = length(velocity);


        if (controllable.isLocal) {
            NetworkManager.send({
                id: MessageId.CMSG_MOVE_REQUEST,
                movement: velocity,
                expectedPosition: transform.localPosition
            } as ClientMovementRequest);
        }

        mobile.velocity.x = velocity.x;
        mobile.velocity.y = velocity.y;

        let direction = Math.floor(((Math.PI + Math.atan2(mobile.velocity.y, mobile.velocity.x)) / (2 * Math.PI)) * 4);
        if (direction == 4) { //TODO: [-0.5, 0] returns 4
            direction = 0;
        }
        mobile.direction = Math.floor(direction);

        spriteRenderer.playAction("walk", 35 / speed, mobile.direction);

        controllable.state = Actions.Move;

    }

    updateMoving(controllable: Controllable, dt: number) {

    }

    stopMoving(controllable: Controllable) {
        let transform = controllable.gameObject.components.get(Transform);
        let mobile = controllable.gameObject.components.get(Mobile);

        let noMovement = {x: 0, y: 0};

        if (controllable.isLocal) {
            NetworkManager.send({
                id: MessageId.CMSG_MOVE_REQUEST,
                movement: noMovement,
                expectedPosition: transform.localPosition
            } as ClientMovementRequest);
        }
        mobile.velocity.x = noMovement.x;
        mobile.velocity.y = noMovement.y;

        this.startIdle(controllable);
    }


    startIdle(controllable: Controllable) {
        let spriteRenderer = controllable.gameObject.components.get(SpriteRenderer);

        //TODO: golem doesnt have this, is that ok? or should i create dummy idle animation

        spriteRenderer.playAction("idle", 1000);

        controllable.state =  Actions.Idle
    }

    updateIdle(controllable: Controllable, dt: number) {
    }


    startAnimation(controllable: Controllable, animationTag: string, duration: number) {

        if (controllable.state == Actions.Move) {
            this.stopMoving(controllable);
        }

        let sprite = controllable.gameObject.components.get(SpriteRenderer);
        sprite.playAction(animationTag, duration); //TODO: should i get direction from server?

        controllable.animationTag = animationTag;
        controllable.animationDuration = duration;
        controllable.animationTime = 0;
        controllable.state = Actions.PlayingAnimation;
    }

    updateAnimation(controllable: Controllable, dt: number) {
        controllable.animationTime += dt;
        if (controllable.animationTime > controllable.animationDuration) {
            this.startIdle(controllable)
        }
    }
}

/*

Keyboard ->
Gamepad  ->  ActionIntent -> -> Command -> *Movement*
Network  ->


ai will move to specific location, not in a facingDirection

*/