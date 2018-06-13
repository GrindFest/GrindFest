// @flow

import Component from "../../infrastructure/world/Component";
import Transform from "./Transform";

const WrapMode = {
    Once: 0,
    Loop: 1,
};

export default class Sprite extends Component{

    assetName: string;
    asset: ISpriteSheetDefinition;

    // Tells if sprite is loaded and can be drawn by renderer
    isReady: boolean = false;

    // Maintain some state within the component
    currentFrame: number = 0;
    currentFrameTime: number = 0;

    currentAction: ISpriteSheetAction;

    // @assetName name of sprite to load
    constructor(assetName: string) {
        super();
        this.assetName = assetName;
    }

    initialize() {
        // Renderer will need this component to know where to draw
        this.transform = this.gameObject.components.get(Transform);

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



    update(gameTime: GameTime) {
        if (this.asset == null) return;

        let action = this.currentAction;

        this.currentFrameTime += gameTime.elapsedGameTime;

        while (this.currentFrameTime >= action.duration) {
            this.currentFrameTime -= action.duration;
            this.currentFrame++;
        }

        if (this.currentFrame >= action.framesCount) { // Animation eneded

            if (this.currentAction.wrapMode === WrapMode.Once) {
                this.setAction(this.asset.defaultAction, true);
            } else if (this.currentAction.wrapMode === WrapMode.Loop) {
                this.currentFrame = 0;
            } else if (this.currentAction.wrapMode === WrapMode.ClampForever) {
                this.currentFrame = action.framesCount - 1;
            }

        }
    }



    draw(ctx, direction) {
        if (this.asset == null) return;

        let action = this.currentAction;

        let animation = action.animationsByDirection.get(direction);
        let thisFrame = animation.frames[this.currentFrame];

        let x: number = (thisFrame * this.asset.frameWidth) % (this.asset.imageWidth);
        let y: number = (thisFrame * this.asset.frameHeight) / (this.asset.imageWidth);
        y = ~~y;
        y *= this.asset.frameHeight;


        ctx.drawImage(this.asset.imageAsset,
            //Source rectangle
            x, y,
            this.asset.frameWidth, this.asset.frameHeight,
            //Destination rectangle
            -this.asset.frameWidth/2, -this.asset.frameHeight,
            this.asset.frameWidth, this.asset.frameHeight);
    }
}