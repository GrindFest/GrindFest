import Component from "../../infrastructure/world/Component";

export enum Actions {
    Idle = 0,
    Move = 1,
    PlayingAnimation = 2,
    Dead = 3
}
export default class Controllable extends Component { //TODO: rename to Puppet?
    isLocal: boolean = false;

    state: Actions;

    animationDuration: number;
    animationTime: number = 0;
    animationTag: string;
}
