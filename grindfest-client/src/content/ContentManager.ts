import SpriteRenderer from "../world/rendering/SpriteRenderer";
import {SpriteSheetDefinition} from "../infrastructure/definitions/SpriteSheetDefinition";
import {TileMapDefinition} from "../infrastructure/definitions/TileMapDefinition";
import {ImageAssetLoader} from "./ImageAssetLoader";
import {JSONAssetLoader} from "./JSONAssetLoader";
import {EffectDefinition} from "../infrastructure/definitions/EffectDefinition";

export interface AssetLoader<T> {
    load(assetName: string): Promise<T>;
}


export class AssetLoadError implements Error {
    name: string;
    message: string;
    cause: Error;

    constructor(assetName: string, message: string, cause?: Error) {
        this.name = "AssetLoadError";
        this.message = assetName + " " + message;
        this.cause = cause;
    }
}

//TODO: its probably bad to store loaded objects as they are stored on filesystem, there could be some better format for storing them in memory
export default class ContentManager {

    static instance: ContentManager = new ContentManager();

    sprites: Array<SpriteRenderer> = [];

    constructor() {

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
    loadedAssets: Map<string, any> = new Map();

    // This bypasses browser caching mechanism
    version: Number;

    get<T>(assetName: string): T {
        let asset = this.loadedAssets.get(assetName);
        if (asset == null) {
            throw "Unknown asset " + assetName;
        }
        return asset;
    }

    async load<T>(assetName: string): Promise<T> {

        let cached = this.loadedAssets.get(assetName);
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

        this.loadedAssets.set(assetName, loadedAsset); //TODO: this won't work if you try to access same resource at the same time, we should have cache the promise at the beginning
        return loadedAsset;

    }

    //TODO: load from real effect file
    async loadEffect(assetName: string): Promise<EffectDefinition> {
        let effect: EffectDefinition = {
            assetNames: ["images/WindSlashLarge1.png", "images/WindSlashLarge2.png", "images/WindSlashLarge4.png", "images/WindSlashLarge6.png"]
        };

        effect.images = [];
        for (let [index, assetName] of effect.assetNames.entries()) {
            effect.images[index] = await ContentManager.instance.load<HTMLImageElement>(assetName);
        }
        this.loadedAssets.set(assetName, effect);
        return effect;

    }

    async loadTileMap(assetName: string): Promise<TileMapDefinition> {
        let mapAsset = await ContentManager.instance.load<TileMapDefinition>(assetName);

        for (let tileset of mapAsset.tilesets) {
            tileset.imageAsset = await this.load<HTMLImageElement>(ContentManager.makeAbsolute(assetName, tileset.image));
        }

        return mapAsset;
    }

    async loadSpriteSheet(assetName: string): Promise<SpriteSheetDefinition> {

        let spriteSheet = await this.load<SpriteSheetDefinition>(assetName);

        console.log(ContentManager.makeAbsolute(assetName, spriteSheet.imageAssetName));
        spriteSheet.imageAsset = await this.load<HTMLImageElement>(ContentManager.makeAbsolute(assetName, spriteSheet.imageAssetName));

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

    static makeAbsolute(base, relative) {
        let stack = base.split("/");
        let parts = relative.split("/");
        stack.pop();

        for (let i = 0; i < parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }


}