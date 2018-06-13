// @flow
import EventEmitter from "../infrastructure/EventEmitter";



export class NetworkManager {

    //TODO: differentiate between LoginServer and GameServer

    static onDisconnected: (event: CloseEvent) => void;
    static onConnected: (event: Event) => void;
    static onError: (event: Event) => void;

    static connectionStatus: string = null;
    static connectionStatusChanged: EventEmitter = new EventEmitter();

    static socket: WebSocket;
    static handlers: Map<number, EventEmitter> = new Map();

    static initialize() {
        NetworkManager.connect("ws://localhost:8080"); //TODO: it might be better to move this into LoginManager, as it needs connect to login server
    }

    static connect(url: string): void {
        console.log("NetworkManager.connect", url);
        NetworkManager.socket = new WebSocket(url);
        NetworkManager.socket.onmessage = (event) => NetworkManager.onMessage(event);
        NetworkManager.socket.onerror = (event) => NetworkManager.onError(event);
        NetworkManager.socket.onclose = (event) => NetworkManager.onDisconnected(event);
        NetworkManager.socket.onopen = (event) => NetworkManager.onConnected(event);
    }

    static registerHandler(messageId: number, handler: (any) => void) { //TODO: this pattern is duplicated on lot of places
        let handlers = NetworkManager.handlers.get(messageId);
        if (handlers == null) {
            handlers = new EventEmitter();
            NetworkManager.handlers.set(messageId, handlers);
        }
        handlers.register(handler);
    }

    static onError(event: Event) {
        NetworkManager.connectionStatus = "ERROR";
        NetworkManager.connectionStatusChanged.emit1(NetworkManager.connectionStatus)
    }

    static onConnected(event: Event) {
        NetworkManager.connectionStatus = "CONNECTED";
        NetworkManager.connectionStatusChanged.emit1(NetworkManager.connectionStatus)
    }

    static onDisconnected(event: CloseEvent) {

    }

    static onMessage(messageEvent: MessageEvent): void {
        console.log("NetworkManager.onMessage", messageEvent.data);
        let message: Message = JSON.parse((messageEvent.data: string));
        let handler = NetworkManager.handlers.get(message.id);
        if (handler == null) {
            throw `No handler available for messageId: ${message.id}`;
        }
        return handler.emit1(message);
    }


    static send(message: any): void {
        console.log("NetworkManager.send", message);
        NetworkManager.socket.send(JSON.stringify(message));
    }
}