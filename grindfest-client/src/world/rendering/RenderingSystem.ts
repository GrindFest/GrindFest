import Camera from "./Camera";
import SpriteRenderer from "./SpriteRenderer";
import GameSystem from "../../infrastructure/world/GameSystem";
import Transform from "../Transform";
import TileMapRenderer from "./TileMapRenderer";
import {AttributeId, MessageId, ServerFloatingNumber} from "../../infrastructure/network/Messages";
import NetworkManager from "../../network/NetworkManager";
import GameObjectDatabase from "../GameObjectDatabase";
import {FloatingTextEffect, ParticleEffect} from "./ParticleEffect";
import {Node2, Node3} from "../../infrastructure/world/Component";
import HeartIndicatorRenderer from "./HeartIndicatorRenderer";

export default class RenderingSystem extends GameSystem {

    cameras: {c1: Camera, c2: Transform}[] = [];
    tileMaps:{c1: TileMapRenderer, c2: Transform}[] = [];
    sprites: {c1: SpriteRenderer, c2:Transform}[] = [];
    floatingTexts: Node2<FloatingTextEffect, Transform>[] = [];
    particles: Node2<ParticleEffect, Transform>[] = [];
    heartIndicators: Node3<HeartIndicatorRenderer, Transform, SpriteRenderer>[] = [];

    //weathers: Array<WeatherRenderer> = new Array<WeatherRenderer>();
    //floatingTexts: Array<FloatingText> = new Array<FloatingText>();

    public context: CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D) {
        super();

        this.context = context;

        this.context.imageSmoothingEnabled = false;

        // We register all components that we need, and they will be added to these arrays, as gameobjects are added to world
        this.registerNodeJunction2(this.tileMaps, TileMapRenderer, Transform);
        this.registerNodeJunction2(this.sprites, SpriteRenderer, Transform);
        this.registerNodeJunction2(this.cameras, Camera, Transform);
        this.registerNodeJunction2(this.floatingTexts, FloatingTextEffect, Transform);
        this.registerNodeJunction3(this.heartIndicators, HeartIndicatorRenderer, Transform, SpriteRenderer);
        this.registerNodeJunction2(this.particles, ParticleEffect, Transform);
        //this.registerNodeJunction2(this.floatingNumbers, InGameText, Transform);
        //this.registerComponent(this.weathers, WeatherEffectRenderer);
        //this.registerComponent(this.floatingTexts, FloatingText);

        NetworkManager.registerHandler(MessageId.SMSG_FLOATING_NUMBER, this.onFloatingNumber.bind(this));

    }

    onFloatingNumber(message: ServerFloatingNumber) {

        let go = this.findGameObjectById(message.goId);
        let transform = go.components.get(Transform);
        let sprite = go.components.get(SpriteRenderer);
        if (sprite.asset == null) return;
        let effectGo = GameObjectDatabase.createGameObject("floatingNumber", {x: transform.worldPosition.x, y: transform.worldPosition.y - sprite.asset.frameWidth*3/4, ...message});

        this.zone.gameObjects.push(effectGo);
    }


    update(delta: number) {
        for (let camera of this.cameras) {
            camera.c1.viewport = {width: this.context.canvas.width, height: this.context.canvas.height}
        }

        for (let sprite of this.sprites) {

            sprite.c1.update(delta);
        }

        this.sprites.sort((a, b) => {
            let transformA = a.c2;
            let transformB = b.c2;
            return transformA.localPosition.y - transformB.localPosition.y;
        });

        // for (let floatingNumberAndTransform of this.floatingNumbers) {
        //     let floatingNumber = floatingNumberAndTransform.c1;
        //     floatingNumber.
        // }
    }

    draw(delta) {

        for (let cameraAndTransform of this.cameras) {
            let cameraTransform = cameraAndTransform.c2;
            let camera = cameraAndTransform.c1;

            let ctx = this.context;

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.save();



            // Set camera transformation and set camera to center of screen
            let x = -(cameraTransform.worldPosition.x * camera.zoom) + (ctx.canvas.width / 2);
            let y = -(cameraTransform.worldPosition.y * camera.zoom) + (ctx.canvas.height / 2);
            ctx.translate(x | 0, y | 0);
            ctx.scale(camera.zoom, camera.zoom);


            for (let tileMapAndTransform of this.tileMaps) {
                let tileMap = tileMapAndTransform.c1;
                let transform = tileMapAndTransform.c2;
                if (tileMap.asset == null) continue;



                let topLeft = {
                    x: Math.max(0, ((cameraTransform.worldPosition.x - ctx.canvas.width / 2 - tileMap.asset.tilewidth) / 64) | 0),
                    y: Math.max(0, ((cameraTransform.worldPosition.y - ctx.canvas.height / 2 - tileMap.asset.tileheight) / 64) | 0)
                };
                let bottomRight = {
                    x: Math.min(tileMap.asset.width, ((cameraTransform.worldPosition.x + ctx.canvas.width / 2 + tileMap.asset.tilewidth) / 64) | 0),
                    y: Math.min(tileMap.asset.height, ((cameraTransform.worldPosition.y + ctx.canvas.height / 2 + tileMap.asset.tileheight) / 64) | 0)
                };

                topLeft = {x:0, y:0}; //TODO: remove
                bottomRight = {x: tileMap.asset.width, y: tileMap.asset.height};

                tileMap.drawLayers(ctx, 0, tileMap.asset.layers.length, topLeft, bottomRight);

            }



            for (let spriteAndTransform of this.sprites) {
                let sprite = spriteAndTransform.c1;
                let transform = spriteAndTransform.c2;

                ctx.save();

                ctx.translate(transform.worldPosition.x, transform.worldPosition.y);

                ctx.fillStyle = "red";
                ctx.fillRect(0, 0, 1, 1);

                sprite.draw(ctx);

                ctx.restore();
            }

            for (let heartIndicatorAndTransform of this.heartIndicators) {
                let heartIndicator = heartIndicatorAndTransform.c1;
                let transform = heartIndicatorAndTransform.c2;
                let sprite = heartIndicatorAndTransform.c3;

                if (sprite.asset == null) continue;

                ctx.save();

                ctx.translate(transform.worldPosition.x, transform.worldPosition.y-sprite.asset.frameHeight*3/4);

                heartIndicator.draw(ctx, heartIndicator.gameObject.get(AttributeId.HitPoints), heartIndicator.gameObject.get(AttributeId.MaxHitPoints));

                ctx.restore();
            }

            for (let particleEffectAndTransform of this.particles) {
                let particleEffect = particleEffectAndTransform.c1;
                let transform = particleEffectAndTransform.c2;
                ctx.save();

                ctx.translate(transform.worldPosition.x, transform.worldPosition.y);
                ctx.rotate(transform.rotation);
                particleEffect.draw(ctx);
                ctx.restore();

            }

            for (let floatingTextAndTransform of this.floatingTexts) {
                let floatingText = floatingTextAndTransform.c1;
                let transform = floatingTextAndTransform.c2;
                ctx.save();

                ctx.translate(transform.worldPosition.x, transform.worldPosition.y);

                floatingText.draw(ctx, transform.scale.x);
                ctx.restore();

            }


            ctx.restore();
        }
    }



}