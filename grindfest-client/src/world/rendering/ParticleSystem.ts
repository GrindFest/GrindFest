import GameSystem from "../../infrastructure/world/GameSystem";
import {FloatingTextEffect, ParticleEffect} from "./ParticleEffect";
import Transform from "../Transform";
import {Node2} from "../../infrastructure/world/Component";
import {randomRange} from "../../infrastructure/Math";
import NetworkManager from "../../network/NetworkManager";
import {MessageId, ServerFloatingNumber, ServerGameObjectPlayEffect} from "../../infrastructure/network/Messages";
import GameObject from "../../infrastructure/world/GameObject";
import GameObjectDatabase from "../GameObjectDatabase";
import SpriteRenderer from "./SpriteRenderer";


export class ParticleSystem extends GameSystem {

    floatingTexts: Node2<FloatingTextEffect, Transform>[] = [];

    particles: Node2<ParticleEffect, Transform>[] = [];

    constructor() {
        super();
        this.registerNodeJunction2(this.floatingTexts, FloatingTextEffect, Transform);
        this.registerNodeJunction2(this.particles, ParticleEffect, Transform);

        NetworkManager.registerHandler(MessageId.SMSG_GO_PLAY_EFFECT, this.onPlayEffect.bind(this));
        NetworkManager.registerHandler(MessageId.SMSG_FLOATING_NUMBER, this.onFloatingNumber.bind(this));

    }


    onFloatingNumber(message: ServerFloatingNumber) {

        let go = this.findGameObjectById(message.goId);
        let transform = go.components.get(Transform);
        let sprite = go.components.get(SpriteRenderer);
        if (sprite.asset == null) return;
        let effectGo = GameObjectDatabase.createGameObject("floatingNumber", {
            x: transform.worldPosition.x,
            y: transform.worldPosition.y - sprite.asset.frameHeight * 1 / 2, ...message //TODO: this sprite thing is weird
        });

        this.zone.gameObjects.push(effectGo);
    }

    onPlayEffect(message: ServerGameObjectPlayEffect) {
        let go = this.findGameObjectById(message.goId);
        let transform = go.components.get(Transform);
        let sprite = go.components.get(SpriteRenderer);

        if (message.effectTag == "windSlashLarge") {

            let x = Math.cos(message.direction) * 24;
            let y = Math.sin(message.direction) * 24;

            let effect = GameObjectDatabase.createGameObject(message.effectTag,
                {
                    x: transform.worldPosition.x + x,
                    y: transform.worldPosition.y + y,
                    ...message
                });
            this.zone.gameObjects.push(effect);
        } else {
            throw "Unknown effect " + message.effectTag;
        }
    }

    update(dt: number) {


        const alphaChange = -0.001;

        const gravity = 0.0001;
        const scaleChange = -0.0005;

        for (let particleEffectAndTransform of this.particles) {
            let particleEffect = particleEffectAndTransform.c1;
            let transform = particleEffectAndTransform.c2;

            particleEffect.totalTime += dt;

            if (particleEffect.particles.length < particleEffect.maxParticles) {
                particleEffect.bornTimer += dt;
                if (particleEffect.bornTimer >= particleEffect.bornRate) {
                    particleEffect.bornTimer = 0;
                    particleEffect.generate(particleEffect.totalTime);
                    particleEffect.bornTimer -= particleEffect.bornRate;
                }

            }

            let i = 0;
            while (i < particleEffect.particles.length) {
                let particle = particleEffect.particles[i];

                //particle.x += particle.velocity.x * dt;
                //particle.y += particle.velocity.y * dt;

                particle.lifespan -= dt;
                if (particle.lifespan <= 0) {
                    particleEffect.particles.splice(i, 1);
                }
                //TODO: apply gravity from particleEffect

                i++;
            }

        }
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