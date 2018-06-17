import Component from "../../infrastructure/world/Component";
import {SpriteSheetAction, SpriteSheetDefinition, WrapMode} from "./SpriteSheetDefinition";
import {Direction} from "../../infrastructure/network/Messages";


export default class SpriteRenderer extends Component{

    assetName: string;
    asset: SpriteSheetDefinition;


    //TODO: stuff below should be on a Node in RenderingSystem

    // Tells if sprite is loaded and can be drawn by renderer
    isReady: boolean = false;

    // Maintain some state within the component
    currentFrame: number = 0;
    currentFrameTime: number = 0;

    currentAction: SpriteSheetAction;

    // @assetName name of sprite to load
    constructor(assetName: string) {
        super();
        this.assetName = assetName;
    }

    initialize() {

    }

    stopAction(actionName: string) {
        if (this.currentAction.name === actionName) {
            this.setAction(this.asset.defaultAction, true);
        }
    }

    setAction(actionName: string, override: boolean = false) {
        if (this.currentAction.name !== actionName) {

            let newAction = this.asset.actionsByName.get(actionName);

            if (!override && this.currentAction.priority > newAction.priority)
                return;

            // Reset frame
            this.currentFrame = 0;
            this.currentAction = newAction;
        }
    }



    update(delta: number, direction: Direction) {

        let action = this.currentAction;

        this.currentFrameTime += delta; //delta.elapsedGameTime;

        while (this.currentFrameTime >= action.duration) {
            this.currentFrameTime -= action.duration;
            this.currentFrame++;
        }

        let animation = action.animationsByDirection.get(direction);

        if (this.currentFrame >= animation.frames.length) { // Animation eneded

            if (this.currentAction.wrapMode === WrapMode.Once) {
                this.setAction(this.asset.defaultAction, true);
            } else if (this.currentAction.wrapMode === WrapMode.Loop) {
                this.currentFrame = 0;
            } else if (this.currentAction.wrapMode === WrapMode.ClampForever) {
                this.currentFrame =  animation.frames.length - 1;
            }

        }
    }



    draw(ctx: CanvasRenderingContext2D, direction: Direction) {

        let action = this.currentAction;

        let animation = action.animationsByDirection.get(direction);
        let thisFrame = animation.frames[this.currentFrame];

        let x = (thisFrame) % (this.asset.imageAsset.width / this.asset.frameWidth);
        let y = Math.floor((thisFrame) / (this.asset.imageAsset.width / this.asset.frameWidth));

        x *= this.asset.frameWidth;
        y *= this.asset.frameHeight;

        ctx.drawImage(this.asset.imageAsset,
            //Source rectangle
            x, y,
            this.asset.frameWidth, this.asset.frameHeight,
            //Destination rectangle
            -(this.asset.frameWidth)/2, -(this.asset.frameHeight),
            this.asset.frameWidth, this.asset.frameHeight);
    }
}