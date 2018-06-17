import GameObject from "../infrastructure/world/GameObject";
import Mobile from "./movement/Mobile";
import Transform from "./Transform";
import Actor from "./zone/Actor";
import SpriteRenderer from "./rendering/SpriteRenderer";
import PowerUser from "./power/PowerUser";


//TODO: merge with server gamobjectdatabase?
//TODO: load templates from json files
export default class GameObjectDatabase {
    static createGameObject(templateName: string, definition: any): GameObject {
        if (templateName == "actor") {
            let actor = new GameObject();
            actor.components.push(new Actor(definition.actorId));
            actor.components.push(new Transform(definition.x, definition.y));
            actor.components.push(new PowerUser()); //TODO: can all actors be skill users?
            actor.components.push(new SpriteRenderer(definition.spriteAsset)); //TODO: this could have the asset loaded, the problem is that this is incorrect place to create the object, it should be from gameobjectadatabse that has access to content, so the contentsystem can be contentmanager afterall
            actor.components.push(new Mobile(definition.velocity));
            return actor;
        } else {
            throw "Unknown template: " + templateName;
        }
    }
}