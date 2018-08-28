import EventEmitter from "../infrastructure/EventEmitter";
import ContentManager from "../content/ContentManager";
import NetworkManager from "../network/NetworkManager";
import {ClientGameReady, MessageId, ServerEnterZone} from "../infrastructure/network/Messages";

export enum GameState {
    NotInGame,
    LoadingZone,
    InZone
}

export class GameSession {
    static instance = new GameSession();

    gameStateChanged: EventEmitter = new EventEmitter();

    zoneTag: string;
    myGameObjectId: number;

    initialize() {

        NetworkManager.instance.registerHandler(MessageId.SMSG_ENTER_ZONE, this.onEnterZone.bind(this));
    }

    async onEnterZone(message: ServerEnterZone) {
        console.log("ZoneSystem.onEnterZone", message);


        this.zoneTag = message.zoneTag;


        this.gameStateChanged.emit1(GameState.LoadingZone);

    }

    ready() {

        //TODO: connect to game server?

        this.gameStateChanged.emit1(GameState.InZone);

        NetworkManager.instance.send({
            id: MessageId.CMSG_GAME_READY
        } as ClientGameReady);

    }
}