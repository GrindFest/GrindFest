import Actor, {Zone} from "../components/Actor";
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
import Mobile from "../components/Mobile";



export class Zone {
    id: number;

    broadcast() {

    }
}

export default class ZoneSystem extends GameSystem {

    actors: Actor[] = [];
    zone: Zone;

    lastActorId = 1;

    constructor() {
        super();


        this.zone = new Zone();
        this.zone.id = 1;

        this.registerNodeJunction(this.actors, Actor);

        NetworkManager.disconnectHandler.register(this.onDisconnect.bind(this));
        NetworkManager.registerHandler(MessageId.CMSG_GAME_READY, this.onGameReady.bind(this));

    }

    findGameObjectByActorId(actorId: number) {
        return this.actors.find( (zoned) => zoned.actorId == actorId).gameObject;
    }

    getZone(zoneId: number) {
        return this.zone;
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
        let zoned = gameObject.components.get(Actor) as Actor;
        if (zoned != null) {
            for (let otherZoned of this.actors) {
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

        let actor = gameObject.components.get(Actor) as Actor;
        if (actor != null) {
            actor.zone = this.getZone(actor.zoneId); //TODO: can i just assign ZoneSystem here, is it ok that the component will have reference to it's system?
            actor.actorId = this.lastActorId++;

            actor.gameObject.sendMessage(new EnterZonePayload());

            //TODO: i should use broadcast here, but that isnt compatible with sending messages to objects
            // it seems that it should be zone -> world and not world -> zone
            // but then there would be nothin like actors?
            for (let otherActor of this.actors) {
                otherActor.gameObject.sendMessage(new ActorEnterZonePayload(actor));
                if (otherActor != actor) {
                    actor.gameObject.sendMessage(new ActorEnterZonePayload(otherActor));
                }
            }
        }

    }

    sendActor(targetClient: Client, gameObject: GameObject) {

        //TODO: how to send names?

        let visual = gameObject.components.get(Visual) as Visual;
        let zoned = gameObject.components.get(Actor) as Actor;
        let transform = gameObject.components.get(Transform) as Transform;
        let mobile = gameObject.components.get(Mobile) as Mobile;


        NetworkManager.send(targetClient, {
            id: MessageId.SMSG_ACTOR_ENTER_ZONE,
            zoneId: zoned.zoneId,
            actorId: zoned.actorId,
            spriteAsset: visual.spriteAsset,
            x: transform.x,
            y: transform.y,
            direction: transform.direction,
            velocity: mobile.velocity
        } as ServerActorEnterZone);
    }

    onEnterZone(owner: GameObject, payload: EnterZonePayload) {
        let netState = owner.components.get(NetState);

        let zoned = owner.components.get(Actor);

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