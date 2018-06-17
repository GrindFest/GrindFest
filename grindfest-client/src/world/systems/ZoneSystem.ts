import GameSystem from "../../infrastructure/world/GameSystem";
import {
    MessageId,
    ServerActorEnterZone,
    ServerActorLeaveZone, ServerActorMove,
    ServerEnterZone
} from "../../infrastructure/network/Messages";
import Actor from "../components/Actor";
import {NetworkManager} from "../../network/NetworkManager";
import TileMapRenderer from "../components/TileMapRenderer";
import SpriteRenderer from "../components/SpriteRenderer";
import Camera from "../components/Camera";
import Transform from "../components/Transform";
import GameObject from "../../infrastructure/world/GameObject";
import WorldManager from "../../infrastructure/world/WorldManager";
import Controllable, {Actions} from "../components/Controllable";
import Mobile from "../components/Mobile";
import GameObjectDatabase from "../GameObjectDatabase";

export default class ZoneSystem extends GameSystem {

    private actors: Actor[] = [];

    private mobiles: {c1: Actor, c2: Mobile}[] = [];

    zoneId: number; // Client can be in only one zon
    myActorId: number;


    constructor() {
        super();

        this.registerNodeJunction(this.actors, Actor);
        this.registerNodeJunction2(this.mobiles, Actor, Mobile);

        NetworkManager.registerHandler(MessageId.SMSG_ACTOR_ENTER_ZONE, this.onActorEnterZone.bind(this));
        NetworkManager.registerHandler(MessageId.SMSG_ACTOR_LEAVE_ZONE, this.onActorLeaveZone.bind(this));
        NetworkManager.registerHandler(MessageId.SMSG_ENTER_ZONE, this.onEnterZone.bind(this));

    }



    onActorLeaveZone(message: ServerActorLeaveZone) {
        let zoned = this.actors.find( (zoned) => zoned.actorId == message.actorId);
        this.world.gameObjects.remove(zoned.gameObject);
    }

    onActorEnterZone(message: ServerActorEnterZone) {
        console.log("ZoneSystem.onActorEnterZone", message);

        let world = this.world;

        //TODO: call gameobjectdatabase.createobject and use data from message as definition
        let actor = GameObjectDatabase.createGameObject("actor", message);

        if (message.actorId == this.myActorId) {
            actor.components.push(new Controllable());
        }
        world.gameObjects.push(actor);


        if (message.actorId == this.myActorId) { // If this is me attach camera to me
            actor.components.push(new Controllable());

            let camera = new GameObject();
            camera.components.push(new Transform(0, 0, actor.components.get(Transform)));
            camera.components.push(new Camera()); //TODO: camera probably shoundlt be a component as its not a behavior of something in the game domain its just a way rendering works. but how is netstate different?

            world.gameObjects.push(camera);
        }
    }

    onEnterZone(message: ServerEnterZone) {
        console.log("ZoneSystem.onEnterZone", message);

        this.zoneId = message.zoneId;
        this.myActorId = message.myActorId;

        let world = this.world;


        let map = new GameObject();
        map.components.push(new Transform(0, 0));
        map.components.push(new TileMapRenderer("/maps/test.json")); //TODO: get map name from packet
        world.gameObjects.push(map);


    }

}