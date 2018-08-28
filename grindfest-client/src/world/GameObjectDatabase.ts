import GameObject from "../infrastructure/world/GameObject";
import Mobile from "./movement/Mobile";
import Transform from "./Transform";
import SpriteRenderer from "./rendering/SpriteRenderer";
import PowerUser from "./power/PowerUser";
import TileMapRenderer from "./rendering/TileMapRenderer";
import Controllable from "./controls/Controllable";
import Timer from "./Timer";
import {FloatingTextEffect, Particle, ParticleEffect} from "./rendering/ParticleEffect";
import {interpolate, length, randomRange, subtract, Vector2} from "../infrastructure/Math";
import HeartIndicatorRenderer from "./rendering/HeartIndicatorRenderer";
import {ParticleSystem} from "./rendering/ParticleSystem";
import {TileMapDefinition} from "../infrastructure/definitions/TileMapDefinition";
import {GroupDefinition, ObjectGroupDefinition} from "../infrastructure/definitions/LayerDefinition";
import Component from "../infrastructure/world/Component";
import {LinearInterpolator} from "./movement/MobileSystem";
import ContentManager from "../content/ContentManager";




//TODO: merge with server gamobjectdatabase?
//TODO: load templates from json files
export default class GameObjectDatabase { //TODO: this is probably zone manager

    static instance: GameObjectDatabase = new GameObjectDatabase();




    //TODO: where should this be?
    static createFromMap(tileMap: TileMapDefinition): GameObject[] {


        let objects = [];
        {
            for (let [i, groupLayer] of tileMap.layers.entries()) {
                if (groupLayer.type == "group") {

                    let go = new GameObject();
                    go.components.push(new Transform());
                    go.components.push(new TileMapRenderer(tileMap, groupLayer as GroupDefinition));

                    for (let layer of (groupLayer as GroupDefinition).layers) {
                        if (layer.type == "objectgroup") {
                            let objectGroup = layer as ObjectGroupDefinition;
                            for (let object of objectGroup.objects) {
                                if (object.type == "mover") {
                                    let from = object.polyline[0];
                                    let to = object.polyline[1];
                                    let speed = 0.08;
                                    //go.components.push(new LinearInterpolator(from, to, speed));
                                }
                            }
                        }
                    }

                    objects.push(go);
                }
            }
        }
        return objects;
    }

    createGameObject(templateName: string, definition: any): GameObject {
        let go = new GameObject();
        go.id = definition.goId;

        if (templateName == "actor") {
            for (let attribute of definition.attributes) {
                go.set(attribute.attributeId, attribute.value)
            }
            go.components.push(new Transform(definition.x, definition.y));
            go.components.push(new PowerUser()); //TODO: can all mobiles be skill users?
            go.components.push(new SpriteRenderer(ContentManager.instance.get(definition.spriteAsset))); //TODO: this could have the asset loaded, the problem is that this is incorrect place to create the object, it should be from gameobjectadatabse that has access to content, so the contentsystem can be contentmanager afterall
            go.components.push(new Mobile());
            go.components.push(new Controllable());

            go.components.push(new HeartIndicatorRenderer(ContentManager.instance.get<HTMLImageElement>("images/heart.png")));

        } else if (templateName == "windSlashLarge") {
            let transform = new Transform(definition.x, definition.y - 16);
            transform.rotation = 1 / 2 * Math.PI + definition.direction; //TODO: why do i have to add PI?
            go.components.push(transform);
            const frameTime = 100;
            let generator = (totalTime: number, emit: (particle: Particle) => void) => {
                if (totalTime < 4 * frameTime) {
                    let particle = {
                        x: -16,
                        y: -24,
                        imageIndex: Math.floor(totalTime / frameTime),
                        lifespan: frameTime
                    };
                    emit(particle);
                }

            };
            let particleEffect = new ParticleEffect();
            particleEffect.maxParticles = 1;
            particleEffect.bornRate = 0;
            particleEffect.generator = generator;


            particleEffect.asset = ContentManager.instance.get("effects/windSlashLarge.json");



            go.components.push(particleEffect);
            go.components.push(Timer.deletingTimer(4 * frameTime));
        } /*else if (templateName == "map") {

            go.components.push(new Transform(0, 0));
            go.components.push(new TileMapRenderer(ContentManager.instance.get("/maps/test.json"))); //TODO: get map name from packet


        } */ else if (templateName == "floatingNumber") {
            go.components.push(new Transform(definition.x, definition.y));
            go.components.push(new FloatingTextEffect(definition.value, {
                r: 255,
                g: 255,
                b: 255,
                a: 1
            }, {x: randomRange(-0.01, 0.01), y: randomRange(-0.05, -0.04)}));
            go.components.push(Timer.deletingTimer(1500)); //TODO: how will i create this from file?
        } else {
            throw "Unknown template: " + templateName;
        }

        return go;
    }
}