import Camera from "../components/Camera";
import Sprite from "../components/Sprite";
import GameSystem from "../../infrastructure/world/GameSystem";
import Transform from "../components/Transform";

export default class RenderingSystem extends GameSystem {

    cameras: Array<Camera> = [];
    //tileMaps: Array<TileMapRenderer> = new Array<TileMapRenderer>();
    sprites: Array<Sprite> = [];
    //weathers: Array<WeatherRenderer> = new Array<WeatherRenderer>();
    //floatingTexts: Array<FloatingText> = new Array<FloatingText>();


    constructor() {
        super();

        // We register all components that we need, and they will be added to these arrays, as gameobjects are added to world
        //this.registerComponent(this.tileMaps, TileMapRenderer);
        this.registerComponent(this.sprites, Sprite); //TODO: register Node? [Transform, Sprite]
        this.registerComponent(this.cameras, Camera); //TODO: register [Transform, Camera]
        //this.registerComponent(this.weathers, WeatherRenderer);
        //this.registerComponent(this.floatingTexts, FloatingText);

    }


    update(delta) {

    }

    draw(delta) {

        for (let camera of this.cameras) {
            let ctx = camera.context;

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.save();

            for (let sprite of this.sprites) {
                let spriteTransform = sprite.gameObject.components[Transform];
                this.updateTransform(ctx, spriteTransform, camera, camera.gameObject.components[Transform]);
                ctx.fillRect(0, 0, 2, 2);
                sprite.draw(ctx, spriteTransform.direction);
            }

            ctx.restore();
        }
    }


    updateTransform(ctx, transform: Transform, camera: Camera, cameraTransform: Transform) {

        // Set camera transformation and set camera to center of screen
        let x = -cameraTransform.worldPosition.x + (camera.context.canvas.width / 2);
        let y = -cameraTransform.worldPosition.y  + (camera.context.canvas.height / 2);

        x += (transform.worldPosition.x + 0.0);
        y += (transform.worldPosition.y + 0.0);

        ctx.setTransform(transform.scale.x, 0, 0, transform.scale.y, x | 0, y | 0);
    }
}