import GameObject from "../infrastructure/world/GameObject";
import NetState from "./NetState";
import Transform from "./Transform";
import Visual from "./Visual";
import Mobile from "./Mobile";
import Behavior, {GolemBrain} from "./behavior/Behavior";
import PowerUser from "./power/PowerUser";
import Combatant from "./combat/Combatant";
import {AttributeId} from "../infrastructure/network/Messages";


export default class GameObjectDatabase {

    //TODO: this should be in zone manager, but i have to rewrite from code to data first, because zone manager doesnt know any components by itself
    static createGameObject(templateName: string, definition: any) {

        //TODO: add loading templates from files

        if (templateName === "hero") {

            //let heroDef: HeroDefinition = definition;

            let go = new GameObject();
            go.components.push(new Transform(definition.x, definition.y));
            go.components.push(new Mobile());
            go.components.push(new NetState(definition.client));
            go.components.push(new PowerUser());
            go.components.push(new Combatant());
            go.set(AttributeId.HitPoints, 12);
            go.set(AttributeId.MaxHitPoints, 12);
            go.components.get(Combatant).team = 0;
            go.components.push(new Visual("/sprites/hero.json"));

            return go;

        } else if (templateName === "golem") {
            let go = new GameObject();
            go.components.push(new Transform(definition.x, definition.y));
            go.components.push(new Behavior(new GolemBrain()));
            go.components.push(new Mobile());
            go.components.push(new PowerUser());
            go.components.push(new Combatant());
            go.set(AttributeId.HitPoints, 12);
            go.set(AttributeId.MaxHitPoints, 12);
            go.components.get(Combatant).team = 1;
            go.components.push(new Visual("/sprites/golem.json")); //TODO: this might be an attribute

            return go;

        } else {
            throw `Unknown template: ${templateName}`;
        }

    }
}