import ZoneManager from "../infrastructure/world/ZoneManager";
import ControllerManager from "../ControllerManager";


const TIME_STEP = 1 / 60;

//Is this GameManager? Is this something like TickManager?
// it has initialize method like other managers,
// is Game collection of Managers? Then i could remove ugly static classes
export default class Game {

    currentTime: number;
    accumulator: number = 0;


    constructor() {
        this.tick = this.tick.bind(this);

    }

    initialize() {
        this.currentTime = performance.now();
        requestAnimationFrame(this.tick);
    }



    tick() {
        requestAnimationFrame(this.tick);

        let newTime = performance.now();
        let frameTime = newTime - this.currentTime;
        this.currentTime = newTime;

        const dt = TIME_STEP;

        this.accumulator += frameTime;

        if (this.accumulator >= 5000) { //TODO: if we are waiting more then 5 seconds to refresh, then don't wait more
            this.accumulator = 5000;
        }

        while (this.accumulator >= dt) {
            this.update(dt);
            this.accumulator -= dt;
        }

        this.draw(dt);
    }

    update(delta: number) {
       ControllerManager.update(delta);
       ZoneManager.update(delta);
    }

    draw(delta: number) {
        ZoneManager.draw(delta);
    }

}