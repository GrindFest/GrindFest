import GameObject from "../infrastructure/world/GameObject";
import Component from "../infrastructure/world/Component";


export default class Timer extends Component {

    static deletingTimer = (duration) => new Timer(duration, (go) => go.zone.gameObjects.remove(go) );

    time: number = 0;
    duration: number;
    callback: (go: GameObject) => void;

    constructor(duration: number, callback: (go: GameObject) => void) {
        super();

        this.duration = duration;
        this.callback = callback;
    }
}