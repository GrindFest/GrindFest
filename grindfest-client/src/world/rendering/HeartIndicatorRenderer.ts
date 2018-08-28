import Component from "../../infrastructure/world/Component";
import {AttributeId} from "../../infrastructure/network/Messages";


//TODO: this seems useless but there could be some settings on how to draw the heart indicator, but then again those settings would just be taken from attributes
// but there could be stuff like local timers
export default class HeartIndicatorRenderer extends Component {

    asset: HTMLImageElement; //TODO: all images should probably be stored somewhere else than on components

    constructor(asset: HTMLImageElement) {
        super();
        this.asset = asset;
    }

    draw(ctx: CanvasRenderingContext2D, amount: number, maxAmount: number) {
        if (this.asset == null) return;

        const hearSize = 4;


        for (let currentHeart = 0; currentHeart < maxAmount; currentHeart += 2) {
            let heart;
            if (amount  > currentHeart + 1) {
                heart = 0;
            } else if (amount === currentHeart + 1) {
                heart = 1
            } else {
                heart = 2;
            }
            ctx.drawImage(this.asset,
                heart * 9, 0, 9, 8,
                (currentHeart/2) * hearSize - (maxAmount/2 * hearSize) / 2, 0, hearSize, hearSize);
        }
    }
}