import GameSystem from "../../infrastructure/world/GameSystem";
import GameObject from "../../infrastructure/world/GameObject";
import NetState from "../NetState";
import Transform from "../Transform";
import {
    ClientGameReady, Message,
    MessageId, ServerAttributeSet, ServerEnterZone, ServerGameObjectEnterZone, ServerGameObjectLeaveZone
} from "../../infrastructure/network/Messages";
import Visual from "../Visual";
import NetworkManager from "../../NetworkManager";
import Client from "../../Client";
import LoginManager from "../../LoginManager";
import GameObjectDatabase from "../GameObjectDatabase";
import Mobile from "../Mobile";
import {default as Component, Node2, Node3} from "../../infrastructure/world/Component";
import {arcCircleCollides, arcRectangleCollides, distance} from "../../infrastructure/Math";
import {SpriteSheetDefinition} from "../../infrastructure/definitions/SpriteSheetDefinition";


export class Collider extends Component {
    asset: SpriteSheetDefinition;

    constructor(asset: SpriteSheetDefinition) {
        super();
        this.asset = asset;
    }
}

export default class ZoneSystem extends GameSystem {

//TODO: how about this? interface Player implements Node2<NetState, Transform>
    players: Node2<NetState, Transform>[] = []; //TODO: transform wouldnt be necessary here if x,y were attributes
    zoneTag: string;
    lastGameObjectId = 1;

    constructor() {
        super();

        this.zoneTag = "zones/test.json";

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
        let selectedHero = client.selectedHero;
        let goHero = GameObjectDatabase.instance.createGameObject("hero", {...selectedHero, client: client});

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

        //TODO: i should use broadcast here, but that isnt compatible with sending messages to objects
        // it seems that it should be zone -> zone and not zone -> zone
        // but then there would be nothin like actors?

        this.broadcastExceptSelf(gameObject, this.createGameObjectEnterZone(gameObject));

        if (netState != null) {
            for (let otherGO of this.zone.gameObjects) {
                let message = this.createGameObjectEnterZone(otherGO);
                if (gameObject.id === otherGO.id) {
                    message.isYou = true;
                }
                NetworkManager.send(netState.client, message)
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

    * findGameObjectsInArcDirection(collisionName, x: number, y: number, direction: number, length: number, radius: number, filter: (go) => boolean): IterableIterator<GameObject> {

        let arcDirection = {x: Math.cos(direction), y: Math.sin(direction)};
        let arcCenter = {x: x, y: y};

        for (let gameObject of this.zone.gameObjects) { //TODO: change to quad tree lookup

            let transform = gameObject.components.get(Transform);
            let collider = gameObject.components.get(Collider);

            let enemyCircleRadius = 0;


            let passed = (filter == null || filter(gameObject));
            if (!passed) {
                continue;
            }

            let collision = collider.asset.collisions.find((c) => c.name == collisionName);

            if (collision == null) {
                continue;
            }

            if (collision.type == "circle") {
                if (arcCircleCollides({
                    center: arcCenter, direction: {
                        x: arcCenter.x + arcDirection.x,
                        y: arcCenter.y + arcDirection.y
                    }, radius: radius, length: length
                },
                    {center: {x: collision.center.x + transform.x, y: collision.center.y + transform.y}, radius: collision.radius })) {
                    yield gameObject;
                }
            } else if (collision.type == "rectangle") {
                if (arcRectangleCollides({
                        center: arcCenter, direction: {
                            x: arcCenter.x + arcDirection.x,
                            y: arcCenter.y + arcDirection.y
                        }, radius: radius, length: length
                    },
                    {topLeft: {x: collision.topLeft.x + transform.x, y: collision.topLeft.y + transform.y}, width: collision.width, height: collision.height})) {
                    yield gameObject;
                }
            }
        }

    }

    //TODO: maybe this is something like spatial system
    findNearestGameObject(x: number, y: number, range: number, filter: (go) => any): GameObject {

        let nearestGameObject = null;
        let minDistance = null;

        for (let gameObject of this.zone.gameObjects) { //TODO: change to quad tree lookup
            if ((filter == null || filter(gameObject))) {

                let transform = gameObject.components.get(Transform);

                let dist = distance({x: x, y: y}, transform);

                if (minDistance == null || dist < minDistance) {
                    nearestGameObject = gameObject;
                    minDistance = dist;
                }
            }
        }

        return nearestGameObject;
    }
}