import Zoned, {Zone} from "../components/Zoned";
import {EnterZonePayload, ActorEnterZonePayload, ActorLeaveZonePayload} from "../payloads/EnterZonePayload";
import GameSystem from "../../infrastructure/world/GameSystem";
import GameObject from "../../infrastructure/world/GameObject";
import NetState from "../components/NetState";
import Transform from "../components/Transform";
import {
    ClientGameReady,
    MessageId,
    ServerActorEnterZone,
    ServerActorLeaveZone,
    ServerEnterZone
} from "../../infrastructure/network/Messages";
import Visual from "../components/Visual";
import NetworkManager from "../../NetworkManager";
import Client from "../../Client";
import LoginManager from "../../LoginManager";
import GameObjectDatabase from "../GameObjectDatabase";


export default class ZoneSystem extends GameSystem {

    zoneds: Zoned[] = [];
    debugZone: Zone;

    lastActorId = 1;

    constructor() {
        super();


        this.debugZone = new Zone();
        this.debugZone.id = 1;

        this.registerNodeJunction(this.zoneds, Zoned);

        NetworkManager.disconnectHandler.register(this.onDisconnect.bind(this));
        NetworkManager.registerHandler(MessageId.CMSG_GAME_READY, this.onGameReady.bind(this));

    }

    findGameObjectByActorId(actorId: number) {
        return this.zoneds.find( (zoned) => zoned.actorId == actorId).gameObject;
    }

    getZone(zoneId: number) {
        return this.debugZone;
    }

    //TODO: move to worldmanager?
    onDisconnect(client: Client) {
        console.log("LoginManager.onDisconnect");
        if (client.hero != null) {  //TODO: shold this even be in a manger and not in a system? maybe just send event to the systems from here
            this.world.gameObjects.remove(client.hero);
        }
    }



    onGameReady(client: Client, message: ClientGameReady) {

        // something has to trasnslate herodefinition to game objects and components
        let heroDef = client.heroes[0];
        let goHero = GameObjectDatabase.createGameObject("hero", {...heroDef, client: client});
        client.hero = goHero;


        this.world.gameObjects.push(goHero);
    }



    afterGameObjectRemoved(gameObject: GameObject) { //TODO: these kind of methods would better work on the component/node collection itself
        let zoned = gameObject.components.get(Zoned) as Zoned;
        if (zoned != null) {
            for (let otherZoned of this.zoneds) {
                otherZoned.gameObject.sendMessage(new ActorLeaveZonePayload(zoned));
            }
        }
    }

    beforeGameObjectAdded(gameObject: GameObject) {

        let networkState = gameObject.components.get(NetState);

        if (networkState != null) {
            gameObject.addHandler(ActorEnterZonePayload, this.onActorEnterZone.bind(this)); //TODO: this and before/after methods are not necessary if it will be in one system, the question is if the systems should be allowed to communicate with each other
            gameObject.addHandler(EnterZonePayload, this.onEnterZone.bind(this));
            gameObject.addHandler(ActorLeaveZonePayload, this.onActorLeaveZonePayload.bind(this));
        }
    }


    afterGameObjectAdded(gameObject: GameObject) { //TODO: change everywhere

        let zoned = gameObject.components.get(Zoned) as Zoned;
        if (zoned != null) {
            zoned.zone = this.getZone(zoned.zoneId);
            zoned.actorId = this.lastActorId++;

            zoned.gameObject.sendMessage(new EnterZonePayload());

            for (let otherZoned of this.zoneds) {
                otherZoned.gameObject.sendMessage(new ActorEnterZonePayload(zoned));
                if (otherZoned != zoned) {
                    zoned.gameObject.sendMessage(new ActorEnterZonePayload(otherZoned));
                }
            }
        }

    }

    sendActor(targetClient: Client, gameObject: GameObject) {

        //TODO: how to send names?

        let visual = gameObject.components.get(Visual) as Visual;
        let zoned = gameObject.components.get(Zoned) as Zoned;
        let transform = gameObject.components.get(Transform) as Transform;


        NetworkManager.send(targetClient, {
            id: MessageId.SMSG_ACTOR_ENTER_ZONE,
            zoneId: zoned.zoneId,
            actorId: zoned.actorId,
            spriteAsset: visual.spriteAsset,
            x: transform.x,
            y: transform.y,
            direction: transform.direction
        } as ServerActorEnterZone);
    }

    onEnterZone(owner: GameObject, payload: EnterZonePayload) {
        let netState = owner.components.get(NetState);

        let zoned = owner.components.get(Zoned);

        NetworkManager.send(netState.client, {
            id: MessageId.SMSG_ENTER_ZONE,
            zoneId: zoned.zone.id,
            myActorId: zoned.actorId,
        } as ServerEnterZone);
    }


    /*
     This will be called for every netstate and for every zoned that is in the zone with that netstate
    */
    onActorEnterZone(owner: GameObject, payload: ActorEnterZonePayload) {

        let netState = owner.components.get(NetState);
        let who = payload.who.gameObject;
        this.sendActor(netState.client, who);
    }

    onActorLeaveZonePayload(owner: GameObject, payload: ActorLeaveZonePayload) {
        let netState = owner.components.get(NetState);

        NetworkManager.send(netState.client, {
            id: MessageId.SMSG_ACTOR_LEAVE_ZONE,
            actorId: payload.who.actorId
        } as ServerActorLeaveZone);
    }

}