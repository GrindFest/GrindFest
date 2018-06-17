import Actor from "./Actor";
import {EnterZonePayload, ActorEnterZonePayload, ActorLeaveZonePayload} from "./EnterZonePayload";
import GameSystem from "../../infrastructure/world/GameSystem";
import GameObject from "../../infrastructure/world/GameObject";
import NetState from "../NetState";
import Transform from "../Transform";
import {
    ClientGameReady, Message,
    MessageId,
    ServerActorEnterZone,
    ServerActorLeaveZone,
    ServerEnterZone
} from "../../infrastructure/network/Messages";
import Visual from "../Visual";
import NetworkManager from "../../NetworkManager";
import Client from "../../Client";
import LoginManager from "../../LoginManager";
import GameObjectDatabase from "../GameObjectDatabase";
import Mobile from "../Mobile";
import {Node2, Node3} from "../../infrastructure/world/Component";



//TODO: how about this? interface Player implements Node2<NetState, Actor>

export default class ZoneSystem extends GameSystem {

    actors: Actor[] = [];
    netStates: Node3<NetState, Actor, Transform>[] = [];
    zoneTag: string;

    lastActorId = 1;

    constructor() {
        super();

        this.zoneTag = "zone/test";

        this.registerNodeJunction(this.actors, Actor);
        this.registerNodeJunction3(this.netStates, NetState, Actor, Transform);

        NetworkManager.disconnectHandler.register(this.onDisconnect.bind(this));
        NetworkManager.registerHandler(MessageId.CMSG_GAME_READY, this.onGameReady.bind(this));

    }

    findGameObjectByActorId(actorId: number) {
        return this.actors.find( (zoned) => zoned.actorId == actorId).gameObject;
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
            this.broadcast({
                id: MessageId.SMSG_ACTOR_LEAVE_ZONE,
                actorId: zoned.actorId
            } as ServerActorLeaveZone);
        }
    }


    afterGameObjectAdded(gameObject: GameObject) { //TODO: change everywhere

        let actor = gameObject.components.get(Actor) as Actor;
        if (actor != null) {
            actor.zone = this;
            actor.actorId = this.lastActorId++;

            let netState = gameObject.components.get(NetState) as NetState;

            if (netState != null) {
                NetworkManager.send(netState.client, {
                    id: MessageId.SMSG_ENTER_ZONE,
                    zoneTag: this.zoneTag,
                    myActorId: actor.actorId,
                } as ServerEnterZone);
            }

            actor.gameObject.sendMessage(new EnterZonePayload());


            //TODO: i should use broadcast here, but that isnt compatible with sending messages to objects
            // it seems that it should be zone -> world and not world -> zone
            // but then there would be nothin like actors?

            this.broadcastExceptSelf(actor, this.createServerActorEnterZone(gameObject));

            for (let otherActor of this.actors) {
                otherActor.gameObject.sendMessage(new ActorEnterZonePayload(actor));
                if (otherActor != actor) {
                    actor.gameObject.sendMessage(new ActorEnterZonePayload(otherActor));
                }

                if (netState != null) {
                    NetworkManager.send(netState.client, this.createServerActorEnterZone(otherActor.gameObject))
                }
            }
        }

    }

    createServerActorEnterZone(gameObject: GameObject) {
        //TODO: how to send names?

        let visual = gameObject.components.get(Visual) as Visual;
        let actor = gameObject.components.get(Actor) as Actor;
        let transform = gameObject.components.get(Transform) as Transform;
        let mobile = gameObject.components.get(Mobile) as Mobile;

        return {
            id: MessageId.SMSG_ACTOR_ENTER_ZONE,
            zoneTag: actor.zoneTag,
            actorId: actor.actorId,
            spriteAsset: visual.spriteAsset,
            x: transform.x,
            y: transform.y,
            direction: transform.direction,
            velocity: mobile.velocity
        } as ServerActorEnterZone;
    }





    broadcast(message: Message) {
        for (let netStateAndActor of this.netStates) {
            let netState = netStateAndActor.c1;
            NetworkManager.send(netState.client, message);
        }
    }

    broadcastExceptSelf(source: Actor, message: Message) {
        for (let netStateAndActor of this.netStates) {
            let netState = netStateAndActor.c1;
            let actor = netStateAndActor.c2;
            if (source != actor) {
                NetworkManager.send(netState.client, message);
            }
        }
    }

    //this is argument for world -> zones, since actor is from world and he cant leave his domain for check who is around him
    broadcastIfVisible(source: Actor, message: Message) {
        for (let netStateAndActorAndTransform of this.netStates) {
            let netState = netStateAndActorAndTransform.c1;
            let actor = netStateAndActorAndTransform.c2;
            let transform = netStateAndActorAndTransform.c3;
            //TODO: if ( |source.transform - actor.transform| < causalityDistance ) {
            NetworkManager.send(netState.client, message);
        }
    }
}