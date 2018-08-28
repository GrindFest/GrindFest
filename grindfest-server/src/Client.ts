import websocket from "websocket";
import GameObject from "./infrastructure/world/GameObject";
import {HeroDefinition} from "./LoginManager";

export default class Client {

    connection: websocket.connection;
    hero: GameObject;

    heroes: HeroDefinition[];
    selectedHero: HeroDefinition;

    constructor(connection: websocket.connection) {
        this.connection = connection;
    }
}