import EventEmitter from "../infrastructure/EventEmitter";
import {Message, MessageId} from "../infrastructure/network/Messages";

export default class NetworkManager {

    //TODO: differentiate between LoginServer and GameServer


    static instance = new NetworkManager();

    connectionStatus: string;
    connectionStatusChanged: EventEmitter = new EventEmitter();

    socket: WebSocket;
    handlers: Map<number, EventEmitter> = new Map();

    initialize() {
        this.connect("ws://localhost:8080"); //TODO: it might be better to move this into LoginManager, as it needs connect to login server
    }

    connect(url: string): void {
        console.log("NetworkManager.connect", url);
        this.socket = new WebSocket(url);
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onerror = this.onError.bind(this);
        this.socket.onclose = this.onDisconnected.bind(this);
        this.socket.onopen = this.onConnected.bind(this);
    }

    //TODO: maybe this could have shortcut from gamesystem
    //TODO: rewrite this to @messageHandler - it seems its not possible
    registerHandler<T>(messageId: number, handler: (message: T) => void) { //TODO: this pattern is duplicated on lot of places
        let handlers = this.handlers.get(messageId);
        if (handlers == null) {
            handlers = new EventEmitter();
            this.handlers.set(messageId, handlers);
        }
        handlers.register(handler);
    }

    onError(event: Event) {
        this.connectionStatus = "ERROR";
        this.connectionStatusChanged.emit1(this.connectionStatus)
    }

    onConnected(event: Event) {
        this.connectionStatus = "CONNECTED";
        this.connectionStatusChanged.emit1(this.connectionStatus)
    }

    onDisconnected(event: CloseEvent) {

    }

    onMessage(messageEvent: MessageEvent): void {
        let message: Message = JSON.parse(messageEvent.data);
        console.log("NetworkManager.onMessage", MessageId[message.id], message);

        let handler = this.handlers.get(message.id);
        if (handler == null) {
            throw `No handler available for messageId: ${MessageId[message.id]}`;
        }
        return handler.emit1(message);
    }


    send(message: Message): void {
        console.log("NetworkManager.send", message);
        this.socket.send(JSON.stringify(message));
    }
}