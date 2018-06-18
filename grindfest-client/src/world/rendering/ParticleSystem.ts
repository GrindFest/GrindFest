import GameSystem from "../../infrastructure/world/GameSystem";
import {FloatingTextEffect} from "./ParticleEffect";
import Transform from "../Transform";
import {Node2} from "../../infrastructure/world/Component";
import {randomRange} from "../../infrastructure/Math";


export class ParticleSystem extends GameSystem {

    floatingTexts: Node2<FloatingTextEffect, Transform>[] = [];

    constructor() {
        super();
        this.registerNodeJunction2(this.floatingTexts, FloatingTextEffect, Transform);
    }


    update(dt: number) {


        const alphaChange = -0.001;

        const gravity = 0.0001;
        const scaleChange = -0.0005;

        for (let floatingTextAndTransform of this.floatingTexts) {
            let floatingText = floatingTextAndTransform.c1;
            let transform = floatingTextAndTransform.c2;


            transform.scale.x = Math.max(0, transform.scale.x + scaleChange * dt);
            transform.scale.y = Math.max(0, transform.scale.y + scaleChange * dt);

            transform.localPosition.x += floatingText.velocity.x * dt;
            transform.localPosition.y += floatingText.velocity.y * dt;

            floatingText.velocity.y += gravity * dt;
            floatingText.color.a = Math.max(0, floatingText.color.a + alphaChange * dt);


        }
    }
}