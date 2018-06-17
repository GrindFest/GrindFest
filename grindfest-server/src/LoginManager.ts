import Client from "./Client";

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

    zoneTag: string,
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
                zoneTag: "zone/test",
                x: Math.round(Math.random() * 2) * 16,
                y: Math.round(Math.random() * 2) * 16,
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