import EventEmitter from "../infrastructure/EventEmitter";
import {Message, MessageId} from "../infrastructure/network/Messages";

export default class NetworkManager {

    //TODO: differentiate between LoginServer and GameServer


    static connectionStatus: string;
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

    //TODO: rewrite this to @messageHandler
    static registerHandler<T>(messageId: number, handler: (message: T) => void) { //TODO: this pattern is duplicated on lot of places
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
        let message: Message = JSON.parse(messageEvent.data);
        console.log("NetworkManager.onMessage", MessageId[message.id], message);

        let handler = NetworkManager.handlers.get(message.id);
        if (handler == null) {
            throw `No handler available for messageId: ${MessageId[message.id]}`;
        }
        return handler.emit1(message);
    }


    static send(message: Message): void {
        console.log("NetworkManager.send", message);
        NetworkManager.socket.send(JSON.stringify(message));
    }
}