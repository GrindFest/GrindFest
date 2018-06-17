import WorldManager from "../infrastructure/world/WorldManager";
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

        while (this.accumulator >= dt) {
            this.update(dt);
            this.accumulator -= dt;
        }

        this.draw(dt);
    }

    update(delta: number) {
       ControllerManager.update(delta);
       WorldManager.update(delta);
    }

    draw(delta: number) {
        WorldManager.draw(delta);
    }

}