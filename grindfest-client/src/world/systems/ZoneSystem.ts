import GameSystem from "../../infrastructure/world/GameSystem";
import {
    MessageId,
    ServerActorEnterZone,
    ServerActorLeaveZone, ServerActorMove,
    ServerEnterZone
} from "../../infrastructure/network/Messages";
import Zoned from "../components/Zoned";
import {NetworkManager} from "../../network/NetworkManager";
import TileMapRenderer from "../components/TileMapRenderer";
import SpriteRenderer from "../components/SpriteRenderer";
import Camera from "../components/Camera";
import Transform from "../components/Transform";
import GameObject from "../../infrastructure/world/GameObject";
import WorldManager from "../../infrastructure/world/WorldManager";
import Controllable, {Actions} from "../components/Controllable";
import Mobile from "../components/Mobile";

export default class ZoneSystem extends GameSystem {

    private zoneds: Zoned[] = [];

    private mobiles: {c1: Zoned, c2: Mobile}[] = [];

    //TODO: should i have multiple zones on client? for loading adjacent zones and seamless world?
    zoneId: number;
    myActorId: number;


    constructor() {
        super();

        this.registerNodeJunction(this.zoneds, Zoned);
        this.registerNodeJunction2(this.mobiles, Zoned, Mobile);

        NetworkManager.registerHandler(MessageId.SMSG_ACTOR_ENTER_ZONE, this.onActorEnterZone.bind(this));
        NetworkManager.registerHandler(MessageId.SMSG_ACTOR_LEAVE_ZONE, this.onActorLeaveZone.bind(this));
        NetworkManager.registerHandler(MessageId.SMSG_ENTER_ZONE, this.onEnterZone.bind(this));

    }



    onActorLeaveZone(message: ServerActorLeaveZone) {
        let zoned = this.zoneds.find( (zoned) => zoned.actorId == message.actorId);
        this.world.gameObjects.remove(zoned.gameObject);
    }

    onActorEnterZone(message: ServerActorEnterZone) {
        console.log("ZoneSystem.onActorEnterZone", message);

        let world = this.world;

        let actor = new GameObject();
        actor.components.push(new Zoned(message.actorId));
        actor.components.push(new Transform(message.x, message.y));
        actor.components.push(new SpriteRenderer("/sprites/hero.json"));
        actor.components.push(new Mobile());
        if (message.actorId == this.myActorId) {
            actor.components.push(new Controllable());
        }
        world.gameObjects.push(actor);


        if (message.actorId == this.myActorId) { // If this is me attach camera to me
            actor.components.push(new Controllable());

            let camera = new GameObject();
            camera.components.push(new Transform(0, 0, actor.components.get(Transform)));
            camera.components.push(new Camera());

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