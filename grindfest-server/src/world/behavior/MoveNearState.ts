import Behavior from "./Behavior";
import Transform from "../Transform";
import {State} from "../../infrastructure/StateMachine";
import {distance, multiply, normalize, subtract} from "../../infrastructure/Math";
import GameObject from "../../infrastructure/world/GameObject";
import Mobile from "../Mobile";
import {AttributeId} from "../../infrastructure/network/Messages";

export class MoveNearState extends State {
    private goalObject: GameObject;
    private range: number;
    private behavior: Behavior;
    private timer: number = 0;
    constructor(behavior: Behavior, goalObject: GameObject, range: number) {//TODO: should speed be agrument?
        super();
        this.behavior = behavior;
        this.goalObject = goalObject;
        this.range = range;
    }

    start() {
        console.log("move to");
        let myTransform = this.behavior.gameObject.components.get(Transform);
        let goalTransform = this.goalObject.components.get(Transform);
        let mobile = this.behavior.gameObject.components.get(Mobile);
        if (distance(myTransform, goalTransform) < this.range) {
            this.isFinished = true;
        }
    }

    update(dt: number) {
        let myTransform = this.behavior.gameObject.components.get(Transform);
        let goalTransform = this.goalObject.components.get(Transform);
        let mobile = this.behavior.gameObject.components.get(Mobile);
        if (distance(myTransform, goalTransform) < this.range) {
            mobile.setVelocity({x:0, y:0});
            this.isFinished = true;
        } else {
            this.timer += dt;
            const directionCheckTimeout = 1000;
            if (this.timer > directionCheckTimeout) {
                mobile.setVelocity(multiply(normalize(subtract(goalTransform, myTransform)), this.behavior.gameObject.get(AttributeId.MovementSpeed)));
                this.timer -= directionCheckTimeout;
            }
        }
    }

}