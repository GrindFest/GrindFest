import GameSystem from "../../infrastructure/world/GameSystem";
import GameObject from "../../infrastructure/world/GameObject";
import NetState from "../NetState";
import Transform from "../Transform";
import {
    ClientGameReady, Message,
    MessageId, ServerAttributeSet, ServerGameObjectEnterZone, ServerGameObjectLeaveZone, ServerHeroEnterZone
} from "../../infrastructure/network/Messages";
import Visual from "../Visual";
import NetworkManager from "../../NetworkManager";
import Client from "../../Client";
import LoginManager from "../../LoginManager";
import GameObjectDatabase from "../GameObjectDatabase";
import Mobile from "../Mobile";
import {Node2, Node3} from "../../infrastructure/world/Component";
import {arcCircleCollides, distance} from "../../infrastructure/Math";


//TODO: how about this? interface Player implements Node2<NetState, Transform>

export default class ZoneSystem extends GameSystem {


    players: Node2<NetState, Transform>[] = []; //TODO: transform wouldnt be necessary here if x,y were attributes
    zoneTag: string;
    lastGameObjectId = 1;

    constructor() {
        super();

        this.zoneTag = "zone/test"; //TODO: why isnt there .json at the end?

        this.registerNodeJunction2(this.players, NetState, Transform);

        NetworkManager.disconnectHandler.register(this.onDisconnect.bind(this));
        NetworkManager.registerHandler(MessageId.CMSG_GAME_READY, this.onGameReady.bind(this));
    }

    update(dt: number) {
        //TODO: What is correct collection here? are there gameobjects that shouldnt be synchronized with client? most likely yes, so how to identify them?
        // maybe it should be some sort of flag on game object? or something making it invisible
        for (let go of this.zone.gameObjects) {

            //TODO: maybe use different time for these synchronizations
            // synchronize attributes

            if (go.isDirty) {

                let attributeChangePacket = {
                    id: MessageId.SMSG_ATTRIBUTE_SET,
                    goId: go.id,
                    changes: []
                } as ServerAttributeSet;

                for (let attribute of go.getDirtyAttributes()) {
                    attributeChangePacket.changes.push({
                        attributeId: attribute.attributeId,
                        value: attribute.value
                    })
                }

                go.clearDirty();

                this.broadcast(attributeChangePacket);
            }

            // synchronize positions
        }
    }

    //TODO: move to worldmanager?
    onDisconnect(client: Client) {
        console.log("LoginManager.onDisconnect");
        if (client.hero != null) {  //TODO: shold this even be in a manger and not in a system? maybe just send event to the systems from here
            this.zone.gameObjects.remove(client.hero);
        }
    }


    onGameReady(client: Client, message: ClientGameReady) {

        // something has to trasnslate herodefinition to game objects and components
        let heroDef = client.heroes[0];
        let goHero = GameObjectDatabase.createGameObject("hero", {...heroDef, client: client});
        client.hero = goHero;


        this.zone.gameObjects.push(goHero);
    }


    afterGameObjectRemoved(gameObject: GameObject) { //TODO: these kind of methods would better work on the component/node collection itself

        this.broadcast({
            id: MessageId.SMSG_GO_LEAVE_ZONE,
            goId: gameObject.id
        } as ServerGameObjectLeaveZone);

    }


    afterGameObjectAdded(gameObject: GameObject) { //TODO: change everywhere


        gameObject.id = this.lastGameObjectId++;

        let netState = gameObject.components.get(NetState) as NetState;

        if (netState != null) {
            NetworkManager.send(netState.client, {
                id: MessageId.SMSG_HERO_ENTER_ZONE,
                zoneTag: this.zoneTag,
                myGameObjectId: gameObject.id,
            } as ServerHeroEnterZone);
        }


        //TODO: i should use broadcast here, but that isnt compatible with sending messages to objects
        // it seems that it should be zone -> zone and not zone -> zone
        // but then there would be nothin like actors?

        this.broadcastExceptSelf(gameObject, this.createGameObjectEnterZone(gameObject));

        if (netState != null) {
            for (let otherGO of this.zone.gameObjects) {
                NetworkManager.send(netState.client, this.createGameObjectEnterZone(otherGO))
            }
        }

    }

    createGameObjectEnterZone(gameObject: GameObject) {
        //TODO: how to send names?

        let visual = gameObject.components.get(Visual) as Visual;
        let transform = gameObject.components.get(Transform) as Transform;
        let mobile = gameObject.components.get(Mobile) as Mobile;


        return {
            id: MessageId.SMSG_GO_ENTER_ZONE,
            goId: gameObject.id,

            spriteAsset: visual.spriteAsset,
            x: transform.x,
            y: transform.y,
            direction: transform.direction,
            velocity: mobile.velocity,

            attributes: gameObject.attributes
        } as ServerGameObjectEnterZone;
    }


    broadcast(message: Message) {
        for (let netStateAndActor of this.players) {
            let netState = netStateAndActor.c1;
            NetworkManager.send(netState.client, message);
        }
    }

    broadcastExceptSelf(source: GameObject, message: Message) {
        for (let netStateAndActor of this.players) {
            let netState = netStateAndActor.c1;
            if (source != netState.gameObject) {
                NetworkManager.send(netState.client, message);
            }
        }
    }

    //this is argument for zone -> zones, since gameObject is from zone and he cant leave his domain for check who is around him
    broadcastIfVisible(source: GameObject, message: Message) {
        for (let netStateAndActorAndTransform of this.players) {
            let netState = netStateAndActorAndTransform.c1;
            let transform = netStateAndActorAndTransform.c2;
            //TODO: if ( |source.transform - gameObject.transform| < causalityDistance ) {
            NetworkManager.send(netState.client, message);
        }
    }

    * findGameObjectsInArcDirection(x: number, y: number, direction: number, length: number, radius: number, filter: (go) => boolean): IterableIterator<GameObject> {

        let arcDirection = {x: Math.cos(direction), y: Math.sin(direction)};
        let arcCenter = {x: x, y: y};

        for (let gameObject of this.zone.gameObjects) { //TODO: change to quad tree lookup

            let transform = gameObject.components.get(Transform);

            let enemyCircleRadius = 0;


            if ((filter == null || filter(gameObject)) && arcCircleCollides(arcCenter, {
                x: arcCenter.x + arcDirection.x,
                y: arcCenter.y + arcDirection.y
            }, radius, length, {x: transform.x, y: transform.y}, enemyCircleRadius)) {
                yield gameObject;
            }
        }

    }

    //TODO: maybe this is something like spatial system
    findNearestGameObject(x: number, y: number, filter: (go) => any): GameObject {

        let nearestGameObject = null;
        let minDistance = null;

        for (let gameObject of this.zone.gameObjects) { //TODO: change to quad tree lookup
            if ((filter == null || filter(gameObject))) {
                let transform = gameObject.components.get(Transform);

                let dist = distance({x: x, y: y}, transform);

                if (minDistance = null || dist < minDistance) {
                    nearestGameObject = gameObject;
                    minDistance = dist;
                }
            }
        }

        return nearestGameObject;
    }
}