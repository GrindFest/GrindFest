import Client from "./Client";
import Transform from "./world/components/Transform";
import Zoned from "./world/components/Zoned";
import Visual from "./world/components/Visual";
import NetState from "./world/components/NetState";
import WorldManager from "./infrastructure/world/WorldManager";
import {
    ClientGameReady,
    ClientLoginRequest,
    LoginStatus,
    MessageId,
    ServerLoginResponse
} from "./infrastructure/network/Messages";
import GameObject from "./infrastructure/world/GameObject";
import NetworkManager from "./NetworkManager";


export interface HeroDefinition { // how to store game objects?
    name: string,

    zoneId: number,
    x: number,
    y: number,

    kills: number,
    deaths: number,
}

export default class LoginManager {


    static onLoginRequest(client: Client, message: ClientLoginRequest)  {

        //TODO: authenticate user


        NetworkManager.send(client, {
            id: MessageId.SMSG_LOGIN_RESPONSE,
            loginStatus: LoginStatus.OK
        } as ServerLoginResponse);

        //TODO: load heroes from database
        client.heroes = [];

        //TODO: add some debug only check
        if (client.heroes.length === 0) {
            let hero: HeroDefinition = {
                name: "Guest " + Math.round(Math.random() * 100),
                zoneId: 1,
                x: Math.round(Math.random() * 2) * 64,
                y: Math.round(Math.random() * 2) * 64,
                kills:0,
                deaths:0,
            };
            client.heroes.push(hero);
        }
    };





    static initialize() {

        NetworkManager.registerHandler(MessageId.CMSG_LOGIN_REQUEST, LoginManager.onLoginRequest);
    }

}