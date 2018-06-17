import GameObject from "../infrastructure/world/GameObject";
import Mobile from "./components/Mobile";
import Transform from "./components/Transform";
import Actor from "./components/Actor";
import SpriteRenderer from "./components/SpriteRenderer";
import SkillUser from "./components/SkillUser";


//TODO: merge with server gamobjectdatabase?
//TODO: load templates from json files
export default class GameObjectDatabase {
    static createGameObject(templateName: string, definition: any): GameObject {
        if (templateName == "actor") {
            let actor = new GameObject();
            actor.components.push(new Actor(definition.actorId));
            actor.components.push(new Transform(definition.x, definition.y));
            actor.components.push(new SkillUser()); //TODO: can all actors be skill users?
            actor.components.push(new SpriteRenderer(definition.spriteAsset)); //TODO: this could have the asset loaded, the problem is that this is incorrect place to create the object, it should be from gameobjectadatabse that has access to content, so the contentsystem can be contentmanager afterall
            actor.components.push(new Mobile(definition.velocity));
            return actor;
        } else {
            throw "Unknown template: " + templateName;
        }
    }
}