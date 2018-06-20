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
import Mobile from "../movement/Mobile";

const debugDrawCallbacks: { frames: number, callback: (ctx: CanvasRenderingContext2D) => void }[] = [];

export function debugDraw(frames: number, callback: (ctx: CanvasRenderingContext2D) => void) {
    debugDrawCallbacks.push({frames: frames, callback: callback});
}

export default class RenderingSystem extends GameSystem {

    cameras: { c1: Camera, c2: Transform }[] = [];
    tileMaps: { c1: TileMapRenderer, c2: Transform }[] = [];
    mobileSprites: Node3<SpriteRenderer, Mobile, Transform>[] = [];
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
        this.registerNodeJunction3(this.mobileSprites, SpriteRenderer, Mobile, Transform);
        this.registerNodeJunction2(this.cameras, Camera, Transform);
        this.registerNodeJunction2(this.floatingTexts, FloatingTextEffect, Transform);
        this.registerNodeJunction3(this.heartIndicators, HeartIndicatorRenderer, Transform, SpriteRenderer);
        this.registerNodeJunction2(this.particles, ParticleEffect, Transform);
        //this.registerNodeJunction2(this.floatingNumbers, InGameText, Transform);
        //this.registerComponent(this.weathers, WeatherEffectRenderer);
        //this.registerComponent(this.floatingTexts, FloatingText);
    }

    update(delta: number) {
        for (let camera of this.cameras) {
            camera.c1.viewport = {width: this.context.canvas.width, height: this.context.canvas.height}
        }

        for (let sprite of this.mobileSprites) {

            sprite.c1.update(delta, sprite.c2.direction);
        }

        //TODO: PERF: implement fast sorting https://tbranyen.com/post/increasing-javascript-array-sorting-performance
        this.mobileSprites.sort((a, b) => {
            let transformA = a.c3;
            let transformB = b.c3;
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

                topLeft = {x: 0, y: 0}; //TODO: remove
                bottomRight = {x: tileMap.asset.width, y: tileMap.asset.height};

                tileMap.drawLayers(ctx, 0, tileMap.asset.spritesLayer, topLeft, bottomRight);


                for (let spriteAndTransform of this.mobileSprites) {
                    let sprite = spriteAndTransform.c1;
                    let mobile = spriteAndTransform.c2;
                    let transform = spriteAndTransform.c3;

                    ctx.save();

                    ctx.translate(transform.worldPosition.x, transform.worldPosition.y);

                    ctx.fillStyle = "red";
                    ctx.fillRect(0, 0, 1, 1);

                    sprite.draw(ctx, mobile.direction);

                    ctx.restore();
                }

                for (let heartIndicatorAndTransform of this.heartIndicators) {
                    let heartIndicator = heartIndicatorAndTransform.c1;
                    let transform = heartIndicatorAndTransform.c2;
                    let sprite = heartIndicatorAndTransform.c3;

                    if (sprite.asset == null) continue;

                    ctx.save();

                    ctx.translate(transform.worldPosition.x, transform.worldPosition.y - sprite.asset.frameHeight * 3 / 4);

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

                tileMap.drawLayers(ctx, tileMap.asset.spritesLayer, tileMap.asset.layers.length, topLeft, bottomRight);


            }

            for (let floatingTextAndTransform of this.floatingTexts) {
                let floatingText = floatingTextAndTransform.c1;
                let transform = floatingTextAndTransform.c2;
                ctx.save();

                ctx.translate(transform.worldPosition.x, transform.worldPosition.y);

                floatingText.draw(ctx, transform.scale.x);
                ctx.restore();

            }

            let i = 0;
            while (i < debugDrawCallbacks.length) {
                let d = debugDrawCallbacks[i];

                ctx.save();
                d.callback(ctx);
                ctx.restore();

                d.frames -= 1;
                if (d.frames <= 0) {
                    debugDrawCallbacks.splice(i, 1);
                }
                i++;
            }


            ctx.restore();
        }
    }


}