import {AssetLoader, AssetLoadError} from "./ContentManager";

export class JSONAssetLoader implements AssetLoader<any> {
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
                            reject(new AssetLoadError(assetName, "Invalid JSON content", e));
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