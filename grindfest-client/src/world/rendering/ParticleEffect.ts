import Component from "../../infrastructure/world/Component";
import Transform from "../Transform";
import {Vector2} from "../../infrastructure/Math";
import {EffectDefinition} from "../../infrastructure/definitions/EffectDefinition";


type Color = {
    r: number;
    g: number;
    b: number;
    a: number;
}

export type Particle = {
    x: number;
    y: number;
    velocity?: Vector2;
    imageIndex: number;
    lifespan: number;
}


export class ParticleEffect extends Component {
    particles: Particle[] = [];
    totalTime: number = 0;
    bornTimer: number = 0;
    bornRate: number = 0;
    maxParticles: number = 0;

    asset: EffectDefinition;

    generator: (totalTime: number, emit: (particle: Particle) => void) => void;


    constructor() {
        super();
        this.emit = this.emit.bind(this);
    }

    draw(ctx: CanvasRenderingContext2D) {

        for (let particle of this.particles) {

            ctx.drawImage(this.asset.images[particle.imageIndex], particle.x, particle.y);
        }

    }

    emit(particle: Particle) {
        this.particles.push(particle);
    }

    generate(totalTime: number) {
        this.generator(totalTime, this.emit);
    }
}

export class FloatingTextEffect extends Component {

    velocity: Vector2;

    text: string;
    color: Color;


    constructor(text: string, color: Color, velocity: Vector2) {
        super();

        this.text = text;
        this.color = color;
        this.velocity = velocity;
    }


    draw(ctx: CanvasRenderingContext2D, scale: number) {

        //TODO: always generating these strings must be slow
        ctx.font =  (0.3 * scale) + "em 'Press Start 2P'";
        ctx.strokeStyle = `rgba(1, 1, 1, ${this.color.a})`;
        ctx.lineWidth = 1;
        ctx.strokeText(this.text, 0, 0);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a})`;
        ctx.fillText(this.text, 0, 0);
    }
}