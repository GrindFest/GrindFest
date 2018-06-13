// @flow

import Sprite from "../components/Sprite";
import GameObject from "../../infrastructure/world/GameObject";
import GameSystem from "../../infrastructure/world/GameSystem";


class ImageAssetLoader implements IAssetLoader<HTMLImageElement> {

    static errorImage: string = "graphics/error.png";

    async load(assetName: string): Promise<HTMLImageElement> {

        return new Promise((resolve, reject) => {
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

class AssetLoadError implements Error {
    name: string;
    message: string;
    cause: Error;

    constructor(message: string, cause?: Error) {
        this.name = "AssetLoadError";
        this.message = message;
        this.cause = cause;
    }
}


class JSONAssetLoader implements IAssetLoader<any> {
    async load(assetName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open("GET", assetName, true);
            request.onerror = (ev: ErrorEvent) => {
                reject(new AssetLoadError("JSON request failed: " + ev.message));
            };

            request.onreadystatechange = (ev: Event) => {
                if (request.readyState === 4) {
                    if (request.status === 200) {

                        try {
                            resolve(JSON.parse(request.responseText));
                        } catch (e) {
                            if (e instanceof SyntaxError) {
                                reject(new AssetLoadError("Invalid JSON content", e));
                            }

                            throw e;
                        }

                    } else if (request.status === 404) {
                        reject(new AssetLoadError("JSON Asset not found"));
                    }
                }
            };
            request.send();
        });
    }
}

export default class ContentSystem extends GameSystem {
    sprites: Array<Sprite> = [];

    constructor() {
        super();

        this.version = Date.now();

        let imageLoader = new ImageAssetLoader();
        this.assetLoaders.set("jpg", imageLoader);
        this.assetLoaders.set("jpeg", imageLoader);
        this.assetLoaders.set("gif", imageLoader);
        this.assetLoaders.set("png", imageLoader);

        let jsonLoader = new JSONAssetLoader();
        this.assetLoaders.set("json", jsonLoader);

    }

    assetLoaders: Map = new Map();

    cachedAssets: Map = new Map();

    // This bypasses browser caching mechanism
    version: Number;


    async load<T>(assetName: string): T {

        let cached = this.cachedAssets.get(assetName);
        if (cached != null) {
            let asset = cached;
            return Promise.resolve(asset);
        }

        let extension = assetName.substr(assetName.lastIndexOf('.') + 1).toLowerCase();

        let assetLoader: IAssetLoader<T> = this.assetLoaders.get(extension);

        if (assetLoader == null) {
            throw "Unknown asset type: " + extension;
        }
        console.log("ContentManager.load", "loading", assetName);
        let loadedAsset = await assetLoader.load("assets/" + assetName + "?v=" + this.version)

        this.cachedAssets[assetName] = loadedAsset;
        return loadedAsset;

    }


    async processSpriteSheet(spriteSheet) {
        const framesPerSecond = 60;

        spriteSheet.imageAsset = await this.load(spriteSheet.imageAssetName);

        spriteSheet.actionsByName = new Map();

        for (let action of spriteSheet.actions) {

            spriteSheet.actionsByName.set(action.name, action);

            for (let animation of action.animations) {
                if (action.framesCount == null) {
                    action.framesCount = animation.frames.length;
                } else {
                    if (action.framesCount !== animation.frames.length) {
                        throw "Invalid animation";
                    }
                }
            }


            action.duration = action.framesCount / framesPerSecond;

            if (typeof action.height === "undefined") {
                action.height = 0;
            }


            action.animationsByDirection = new Map();

            for (let animation of action.animations) {
                action.animationsByDirection.set(animation.direction, animation);
            }
        }

        return spriteSheet;

    }

    afterGameObjectAdded(gameObject: GameObject): void {

        for (let component of gameObject.components) {
            if (component.constructor === Sprite) {

                this.load(component.assetName).then(async (spriteSheet) => {

                    // We need to load spritesheet
                    component.asset = await this.processSpriteSheet(spriteSheet);
                    component.currentAction = component.asset.actionsByName.get(component.asset.defaultAction);
                });

            }
        }

    }
}