import Client from "./Client";

import {
    ClientGameReady,
    ClientLoginRequest,
    LoginStatus,
    MessageId, ServerEnterZone,
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
                zoneTag: "zones/test.json",
                x: 7 * 16 + 8,
                y: 3 * 16 + 8,
                kills:0,
                deaths:0,
            };
            client.heroes.push(hero);
        }


        //TODO: here might be some select hero packet
        client.selectedHero = client.heroes[0];



        NetworkManager.send(client, {
            id: MessageId.SMSG_ENTER_ZONE,
            zoneTag: client.selectedHero.zoneTag
        } as ServerEnterZone);
    };





    static initialize() {

        NetworkManager.registerHandler(MessageId.CMSG_LOGIN_REQUEST, LoginManager.onLoginRequest);
    }

}