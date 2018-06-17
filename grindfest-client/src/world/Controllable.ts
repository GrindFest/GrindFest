import Component from "../infrastructure/world/Component";

export enum Actions {
    Move,
    Skill1,
}
export default class Controllable extends Component {
    currentAction: Actions;
}
