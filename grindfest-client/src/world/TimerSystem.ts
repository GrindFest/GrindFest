import GameSystem from "../infrastructure/world/GameSystem";
import Timer from "./Timer";


export default class TimerSystem extends GameSystem {
    private timers: Timer[] = [];

    constructor() {
        super();
        this.registerNodeJunction(this.timers, Timer);
    }

    update(dt: number) {
        for (let timer of this.timers) {
            timer.time += dt;
            if (timer.time > timer.duration) {
                timer.callback(timer.gameObject);
            }
        }
    }
}