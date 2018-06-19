import SpriteRenderer from "./rendering/SpriteRenderer";
import GameObject from "../infrastructure/world/GameObject";
import GameSystem from "../infrastructure/world/GameSystem";
import {SpriteSheetDefinition} from "../infrastructure/definitions/SpriteSheetDefinition";
import TileMapRenderer from "./rendering/TileMapRenderer";
import {TileMapDefinition} from "../infrastructure/definitions/TileMapDefinition";
import HeartIndicatorRenderer from "./rendering/HeartIndicatorRenderer";
import {ParticleEffect} from "./rendering/ParticleEffect";

interface AssetLoader<T> {
    load(assetName: string): Promise<T>;
}

class ImageAssetLoader implements AssetLoader<HTMLImageElement> {

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

class AssetLoadError implements Error {
    name: string;
    message: string;
    cause: Error;

    constructor(assetName: string, message: string, cause?: Error) {
        this.name = "AssetLoadError";
        this.message = assetName + " " + message;
        this.cause = cause;
    }
}


class JSONAssetLoader implements AssetLoader<any> {
    async load(assetName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open("GET", assetName, true);
            request.onerror = (ev: ErrorEvent) => {
                reject(new AssetLoadError(assetName,"JSON request failed: " + ev.message));
            };

            request.onreadystatechange = (ev: Event) => {
                if (request.readyState === 4) {
                    if (request.status === 200) {

                        try {
                            resolve(JSON.parse(request.responseText));
                        } catch (e) {
                            if (e instanceof SyntaxError) {
                                reject(new AssetLoadError(assetName, "Invalid JSON content", e));
                            }

                            throw e;
                        }

                    } else if (request.status === 404) {
                        reject(new AssetLoadError(assetName, "JSON Asset not found"));
                    }
                }
            };
            request.send();
        });
    }
}

//TODO: this can be made into manager, as everything will be loaded from gameobjectdatabase
export default class ContentSystem extends GameSystem {
    sprites: Array<SpriteRenderer> = [];

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

    assetLoaders: Map<string, any> = new Map();
    cachedAssets: Map<string, any> = new Map();

    // This bypasses browser caching mechanism
    version: Number;


    async load<T>(assetName: string): Promise<T> {

        let cached = this.cachedAssets.get(assetName);
        if (cached != null) {
            return Promise.resolve(cached);
        }

        let extension = assetName.substr(assetName.lastIndexOf('.') + 1).toLowerCase();

        let assetLoader: AssetLoader<T> = this.assetLoaders.get(extension);

        if (assetLoader == null) {
            throw "Unknown asset type: " + extension;
        }
        console.log("ContentManager.load", "loading", assetName);
        let loadedAsset;
        try {
            loadedAsset = await assetLoader.load("assets/" + assetName + "?v=" + this.version)
        } catch (e) {
            console.error("Unable to load asset", assetName, e)
        }

        this.cachedAssets.set(assetName, loadedAsset); //TODO: this won't work if you try to access same resource at the same time, we should have cache the promise at the beginning
        return loadedAsset;

    }


    async processSpriteSheet(spriteSheet): Promise<SpriteSheetDefinition> {
        const framesPerSecond = 60;

        spriteSheet.imageAsset = await this.load(spriteSheet.imageAssetName);

        spriteSheet.actionsByName = new Map();

        for (let action of spriteSheet.actions) {

            spriteSheet.actionsByName.set(action.name, action);


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

    static absolute(base, relative) {
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); // remove current file name (or empty string)
                     // (omit if "base" is the current folder without trailing slash)
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }

    //TODO: logic in this method should be somewhere in contentmanager but called form gameobjectdatabase
    async afterGameObjectAdded(gameObject: GameObject): Promise<void> {

        for (let component of gameObject.components) {
            if (component instanceof TileMapRenderer) {
                let tileMapRenderer: TileMapRenderer = component;
                // We need to load tilemap
                let mapAsset = await this.load<TileMapDefinition>(component.assetName);

                for (let [index, layer] of mapAsset.layers.entries()) {
                    if (layer.name === "Collisions") {
                        mapAsset.collisionLayer = layer;
                    }

                    if (layer.name === "Sprites") {
                        mapAsset.spritesLayer = index;
                    }
                }

                for (let tileset of mapAsset.tilesets) {
                    tileset.imageAsset = await this.load<HTMLImageElement>(ContentSystem.absolute(component.assetName, tileset.image));
                }

                tileMapRenderer.asset = mapAsset;

            } else if (component instanceof ParticleEffect) {
                let particleEffect: ParticleEffect = component;

                let assets: HTMLImageElement[] = [];
                for (let [index, assetName] of particleEffect.assetNames.entries()) {
                    assets[index] =await this.load<HTMLImageElement>(assetName);
                }
                particleEffect.assets = assets;

            } else if (component instanceof SpriteRenderer) {
                let sprite: SpriteRenderer = component;
                let spriteSheet = await this.load<HTMLImageElement>(sprite.assetName);

                sprite.asset = await this.processSpriteSheet(spriteSheet);
            } else if (component instanceof HeartIndicatorRenderer) {
                let heartIndicatorRenderer: HeartIndicatorRenderer = component;

                heartIndicatorRenderer.asset = await this.load<HTMLImageElement>(heartIndicatorRenderer.assetName);
            }
        }

    }
}