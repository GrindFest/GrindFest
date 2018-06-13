import NetworkManager from "./NetworkManager";
import Client from "./Client";
import Transform from "./world/components/Transform";
import Zoned from "./world/components/Zoned";
import Visual from "./world/components/Visual";
import NetState from "./world/components/NetState";
import WorldManager from "./infrastructure/world/WorldManager";
import {MessageId} from "./infrastructure/network/Messages";
import GameObject from "./infrastructure/world/GameObject";


interface HeroDefinition { // how to store game objects?
    name: string,

    actorId: number,
    zoneId: number,
    x: number,
    y: number,

    sex: boolean,
    kills: number,
    deaths: number,
}

export default class LoginManager {

    //TODO: move to worldmanager?
    static onDisconnect(client: Client) {
        console.log("LoginManager.onDisconnect");
        if (client.hero != null) {
            WorldManager.mainWorld.gameObjects.remove(client.hero);
        }
    }

    static onLoginRequest(client: Client, message: ClientLoginRequestMessage)  {

        //TODO: authenticate user


        NetworkManager.send(client, {
            id: MessageId.SMSG_LOGIN_RESPONSE,
            loginStatus: "LOGGED_IN"
        });

        //TODO: load heroes from database
        client.heroes = [];

        //TODO: add some debug only check
        if (client.heroes.length === 0) {
            let hero: HeroDefinition = {
                name: "Filip",
                actorId: 1,
                zoneId: 1,
                x: 32,
                y: 64
            };
            client.heroes.push(hero)
        }

        // something has to trasnslate herodefinition to game objects and components


        let heroDef = client.heroes[0];
        heroDef.client = client;
        let goHero = LoginManager.createGameObject("hero", heroDef);
        client.hero = goHero;
        WorldManager.mainWorld.gameObjects.push(goHero);

    };

//TODO: this should be in world manager, but i have to rewrite from code to data first
    static createGameObject(templateName: string, definition: any) {

        //TODO: add loading templates from files

        if (templateName === "hero") {

            //let heroDef: HeroDefinition = definition;

            let go = new GameObject();
            go.components.push(new Transform(definition.x, definition.y));
            go.components.push(new NetState(definition.client));
            go.components.push(new Zoned(definition.actorId, definition.zoneId));
            go.components.push(new Visual("body/male/Light"));

            return go;

        } else {
            throw `Unknown template: ${templateName}`;
        }

    }

    static initialize() {

        NetworkManager.disconnectHandler.register(this.onDisconnect);
        NetworkManager.registerHandler(MessageId.CMSG_LOGIN_REQUEST, this.onLoginRequest);
    }

}