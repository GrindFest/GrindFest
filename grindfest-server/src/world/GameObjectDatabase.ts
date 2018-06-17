import Actor from "./components/Actor";
import GameObject from "../infrastructure/world/GameObject";
import NetState from "./components/NetState";
import Transform from "./components/Transform";
import Visual from "./components/Visual";
import Mobile from "./components/Mobile";
import Behavior from "./components/Behavior";


export default class GameObjectDatabase {

    //TODO: this should be in world manager, but i have to rewrite from code to data first, because world manager doesnt know any components by itself
    static createGameObject(templateName: string, definition: any) {

        //TODO: add loading templates from files

        if (templateName === "hero") {

            //let heroDef: HeroDefinition = definition;

            let go = new GameObject();
            go.components.push(new Transform(definition.x, definition.y));
            go.components.push(new Mobile());
            go.components.push(new NetState(definition.client));
            go.components.push(new Actor(definition.zoneId));
            go.components.push(new Visual("/sprites/hero.json"));

            return go;

        } else if (templateName === "golem") {
            let go = new GameObject();
            go.components.push(new Transform(definition.x, definition.y));
            go.components.push(new Behavior());
            go.components.push(new Mobile());
            go.components.push(new Actor(definition.zoneId));
            go.components.push(new Visual("/sprites/golem.json"));

            return go;

        } else {
            throw `Unknown template: ${templateName}`;
        }

    }
}