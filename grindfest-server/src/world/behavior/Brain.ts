import {State, StateGenerator} from "../../infrastructure/StateMachine";
import Behavior from "./Behavior";

export abstract class Brain implements StateGenerator<Behavior> {

    onSeeGameObject(go) {

    }

    onLostGameObject(go) {

    }

    abstract execute(context: Behavior): IterableIterator<State>;
}