import GameObject from "../infrastructure/world/GameObject";
import Mobile from "./movement/Mobile";
import Transform from "./Transform";
import SpriteRenderer from "./rendering/SpriteRenderer";
import PowerUser from "./power/PowerUser";
import TileMapRenderer from "./rendering/TileMapRenderer";
import Controllable from "./controls/Controllable";
import Timer from "./Timer";
import {FloatingTextEffect, Particle, ParticleEffect} from "./rendering/ParticleEffect";
import {randomRange} from "../infrastructure/Math";
import HeartIndicatorRenderer from "./rendering/HeartIndicatorRenderer";
import {ParticleSystem} from "./rendering/ParticleSystem";


//TODO: merge with server gamobjectdatabase?
//TODO: load templates from json files
export default class GameObjectDatabase {




    static createGameObject(templateName: string, definition: any): GameObject {
        let go = new GameObject();
        go.id = definition.goId;

        if (templateName == "actor") {
            for (let attribute of definition.attributes) {
                go.set(attribute.attributeId, attribute.value)
            }
            go.components.push(new Transform(definition.x, definition.y));
            go.components.push(new PowerUser()); //TODO: can all mobiles be skill users?
            go.components.push(new SpriteRenderer(definition.spriteAsset)); //TODO: this could have the asset loaded, the problem is that this is incorrect place to create the object, it should be from gameobjectadatabse that has access to content, so the contentsystem can be contentmanager afterall
            go.components.push(new Mobile());
            go.components.push(new Controllable());
            go.components.push(new HeartIndicatorRenderer());

        } else if (templateName == "windSlashLarge") {
            let transform = new Transform(definition.x, definition.y);
            transform.rotation = 1/2*Math.PI + definition.direction; //TODO: why do i have to add PI?
            go.components.push(transform);
            let generator = (totalTime: number, emit: (particle: Particle) => void) => {
                const frameTime = 100;
                if (totalTime < 4*frameTime) {
                    let particle = {
                        x: -16,
                        y: -24,
                        imageIndex: Math.floor(totalTime / frameTime),
                        lifespan: frameTime
                    };
                    if (particle.imageIndex == 4) {
                        console.log(totalTime, frameTime);
                        debugger;
                    }
                    emit(particle);
                }

            };
            let particleEffect = new ParticleEffect();
            particleEffect.maxParticles = 1;
            particleEffect.bornRate = 0;
            particleEffect.generator = generator;
            particleEffect.assetNames = ["/images/WindSlashLarge1.png","/images/WindSlashLarge2.png","/images/WindSlashLarge4.png","/images/WindSlashLarge6.png"];
            go.components.push(particleEffect);
        } else if (templateName == "map") {

            go.components.push(new Transform(0, 0));
            go.components.push(new TileMapRenderer("/maps/test.json")); //TODO: get map name from packet


        } else if (templateName == "floatingNumber") {
            go.components.push(new Transform(definition.x, definition.y));
            go.components.push(new FloatingTextEffect(definition.value, {r: 255, g:255, b: 255, a: 1},  {x: randomRange(-0.01, 0.01), y: randomRange(-0.05, -0.04)}));
            //floatingNumber.components.push(Timer.deletingTimer(1.5)); //TODO: how will i create this from file?
        } else {
            throw "Unknown template: " + templateName;
        }

        return go;
    }
}