import Component from "../../infrastructure/world/Component";
import {SpriteSheetAction, SpriteSheetDefinition, WrapMode} from "../../infrastructure/definitions/SpriteSheetDefinition";
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

    currentAction: string;

    duration: number;

    // @assetName name of sprite to load
    constructor(assetName: string) {
        super();
        this.assetName = assetName;
    }


    // stopAction(actionName: string) {
    //     if (this.currentAction.name === actionName) {
    //         this.playAction(this.asset.defaultAction, 1000);
    //     }
    // }

    playAction(actionName: string, duration: number) {

        // Reset frame
        this.currentFrame = 0;
        this.currentAction = actionName;
        this.currentFrameTime = 0;
        this.duration = duration;
    }


    getDirection(direction: number): Direction {
        //TODO: change this to some better arc circle sections, or whatever its called
        let dir = Math.floor(((Math.PI + direction) / (2 * Math.PI)) * 4);
        if (dir == 4) { //TODO: [-0.5, 0] returns 4 //TODO: use directions from current animation, then we can remove golem animations for up and down and it will be correctly computed by this
            dir = 0;
        }
        return dir;
    }

    update(delta: number, direction: number) {

        if (this.asset == null || this.currentAction == null) {
            return;
        }
        let action = this.asset.actionsByName.get(this.currentAction);

        this.currentFrameTime += delta; //delta.elapsedGameTime;


        let animation = action.animationsByDirection.get(this.getDirection(direction));

        let frameDuration = this.duration / animation.frames.length;
        while (this.currentFrameTime >= frameDuration) {
            this.currentFrameTime -= frameDuration;
            this.currentFrame++;
        }


        if (this.currentFrame >= animation.frames.length) { // Animation eneded

            if (action.wrapMode === WrapMode.Once) {
                this.currentAction = null;
            } else if (action.wrapMode === WrapMode.Loop) {
                this.currentFrame = 0;
            } else if (action.wrapMode === WrapMode.ClampForever) {
                this.currentFrame =  animation.frames.length - 1;
            }

        }
    }


//maybe its not problem to have methods on components, but they can't access attributes from here or expect other components to exist
    draw(ctx: CanvasRenderingContext2D, direction: number) {

        if (this.asset == null || this.currentAction == null) {
            return;
        }

        let action = this.asset.actionsByName.get(this.currentAction);

        let animation = action.animationsByDirection.get(this.getDirection(direction));
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