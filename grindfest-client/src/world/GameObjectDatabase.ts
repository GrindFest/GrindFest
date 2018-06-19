import GameObject from "../infrastructure/world/GameObject";
import Mobile from "./movement/Mobile";
import Transform from "./Transform";
import SpriteRenderer from "./rendering/SpriteRenderer";
import PowerUser from "./power/PowerUser";
import TileMapRenderer from "./rendering/TileMapRenderer";
import Controllable from "./controls/Controllable";
import Timer from "./Timer";
import {FloatingTextEffect} from "./rendering/ParticleEffect";
import {randomRange} from "../infrastructure/Math";


//TODO: merge with server gamobjectdatabase?
//TODO: load templates from json files
export default class GameObjectDatabase {
    static createGameObject(templateName: string, definition: any): GameObject {
        if (templateName == "actor") {
            let actor = new GameObject();
            actor.id = definition.goId;
            actor.components.push(new Transform(definition.x, definition.y));
            actor.components.push(new PowerUser()); //TODO: can all mobiles be skill users?
            actor.components.push(new SpriteRenderer(definition.spriteAsset)); //TODO: this could have the asset loaded, the problem is that this is incorrect place to create the object, it should be from gameobjectadatabse that has access to content, so the contentsystem can be contentmanager afterall
            actor.components.push(new Mobile());
            actor.components.push(new Controllable());

            return actor;
        } else if (templateName == "map") {

            let map = new GameObject();
            map.components.push(new Transform(0, 0));
            map.components.push(new TileMapRenderer("/maps/test.json")); //TODO: get map name from packet

            return map;
        } else if (templateName == "floatingNumber") {

            let floatingNumber = new GameObject();
            floatingNumber.components.push(new Transform(definition.x, definition.y));
            floatingNumber.components.push(new FloatingTextEffect(definition.value, {r: 255, g:255, b: 255, a: 1},  {x: randomRange(-0.01, 0.01), y: randomRange(-0.05, -0.04)}));
            //floatingNumber.components.push(Timer.deletingTimer(1.5)); //TODO: how will i create this from file?

            return floatingNumber;
        } else {
            throw "Unknown template: " + templateName;
        }
    }
}