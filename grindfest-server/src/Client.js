import websocket from "websocket";
import GameObject from "./infrastructure/world/GameObject";

export default class Client {

    connection: websocket.connection;
    hero: GameObject;

    constructor(connection: websocket.connection) {
        this.connection = connection;
    }
}