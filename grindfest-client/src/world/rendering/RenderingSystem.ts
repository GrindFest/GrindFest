import Camera from "./Camera";
import SpriteRenderer from "./SpriteRenderer";
import GameSystem from "../../infrastructure/world/GameSystem";
import Transform from "../Transform";
import TileMapRenderer from "./TileMapRenderer";
import GameObject from "../../infrastructure/world/GameObject";

export default class RenderingSystem extends GameSystem {

    cameras: {c1: Camera, c2: Transform}[] = [];
    tileMaps:{c1: TileMapRenderer, c2: Transform}[] = [];
    sprites: {c1: SpriteRenderer, c2:Transform}[] = [];
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
        //this.registerComponent(this.weathers, WeatherRenderer);
        //this.registerComponent(this.floatingTexts, FloatingText);

    }


    update(delta: number) {
        for (let camera of this.cameras) {
            camera.c1.viewport = {width: this.context.canvas.width, height: this.context.canvas.height}
        }
        for (let sprite of this.sprites) {
            if (sprite.c1.asset == null) continue;

            sprite.c1.update(delta, sprite.c2.direction);
        }

        this.sprites.sort((a, b) => {
            let transformA = a.c2;
            let transformB = b.c2;
            return transformA.localPosition.y - transformB.localPosition.y;
        });
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

                topLeft = {x:0, y:0};
                bottomRight = {x: tileMap.asset.width, y: tileMap.asset.height};

                tileMap.drawLayers(ctx, 0, tileMap.asset.layers.length, topLeft, bottomRight);

            }

            for (let spriteAndTransform of this.sprites) {
                let sprite = spriteAndTransform.c1;
                let spriteTransform = spriteAndTransform.c2;

                if (sprite.asset == null) continue;

                ctx.save();

                ctx.translate(spriteTransform.worldPosition.x, spriteTransform.worldPosition.y);

                ctx.fillRect(0, 0, 2, 2);
                sprite.draw(ctx, spriteTransform.direction);

                ctx.restore();
            }


            ctx.restore();
        }
    }



}