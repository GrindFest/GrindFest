import WorldManager from "../infrastructure/world/WorldManager";

//Is this GameManager? Is this something like TickManager?
// it has initialize method like other managers,
// is Game collection of Managers? Then i could remove ugly static classes
export default class Game {

    lastTick;


    constructor() {
        this.tick = this.tick.bind(this);

    }

    initialize() {
        this.lastTick = performance.now();
        requestAnimationFrame(this.tick);
    }

    tick() {
        requestAnimationFrame(this.tick);

        let now = performance.now();
        let delta = now - this.lastTick;
        this.lastTick = now;

        this.update(delta);
        this.draw(delta);


    }

    update(delta) {
       WorldManager.update(delta);
    }

    draw(delta) {
        WorldManager.draw(delta);
    }

}