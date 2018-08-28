import {AssetLoader} from "./ContentManager";

export class ImageAssetLoader implements AssetLoader<HTMLImageElement> {

    static errorImage: string = "graphics/error.png";

    async load(assetName: string): Promise<HTMLImageElement> {

        return new Promise<HTMLImageElement>((resolve, reject) => {
            let asset = new Image();
            asset.onerror = (ev: ErrorEvent) => {
                reject(ev.error);
            };
            asset.onload = (ev: Event) => {
                resolve(asset);
            };
            asset.src = assetName;
            if (asset.complete) {
                resolve(asset);
            }
        });

    }
}