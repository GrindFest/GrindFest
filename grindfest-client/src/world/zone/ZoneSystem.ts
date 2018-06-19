import GameSystem from "../../infrastructure/world/GameSystem";
import {
    MessageId, ServerGameObjectEnterZone,
    ServerGameObjectLeaveZone,
    ServerHeroEnterZone
} from "../../infrastructure/network/Messages";
import NetworkManager from "../../network/NetworkManager";
import Camera from "../rendering/Camera";
import Transform from "../Transform";
import GameObject from "../../infrastructure/world/GameObject";
import Controllable from "../controls/Controllable";
import Mobile from "../movement/Mobile";
import GameObjectDatabase from "../GameObjectDatabase";
import ControlsSystem from "../controls/ControlsSystem";

export default class ZoneSystem extends GameSystem {


    private mobiles: Mobile[] = [];

    zoneTag: string; // Client can be in only one zone
    myGameObjectId: number;


    constructor() {
        super();

        this.registerNodeJunction(this.mobiles, Mobile);

        NetworkManager.registerHandler(MessageId.SMSG_GO_ENTER_ZONE, this.onActorEnterZone.bind(this));
        NetworkManager.registerHandler(MessageId.SMSG_GO_LEAVE_ZONE, this.onActorLeaveZone.bind(this));
        NetworkManager.registerHandler(MessageId.SMSG_HERO_ENTER_ZONE, this.onHeroEnterZone.bind(this));

    }



    onActorLeaveZone(message: ServerGameObjectLeaveZone) {
        let go = this.findGameObjectById(message.goId)
        this.zone.gameObjects.remove(go);
    }

    onActorEnterZone(message: ServerGameObjectEnterZone) {
        console.log("ZoneSystem.onActorEnterZone", message);

        let zone = this.zone;

        //TODO: call gameobjectdatabase.createobject and use data from message as definition
        let actor = GameObjectDatabase.createGameObject("actor", message);

        if (message.goId == this.myGameObjectId) {
            actor.components.get(Controllable).isLocal = true;
        }
        zone.gameObjects.push(actor);


        let controlSystem = zone.gameSystems.find( (gs) => gs instanceof ControlsSystem) as ControlsSystem;
        if (message.velocity.x == 0 && message.velocity.y == 0) {
            controlSystem.startIdle(actor.components.get(Controllable));
        } else {
            controlSystem.startMoving(actor.components.get(Controllable), message.velocity);
        }

        if (message.goId == this.myGameObjectId) { // If this is me attach camera to me

            let camera = new GameObject();
            camera.components.push(new Transform(0, 0, actor.components.get(Transform)));
            camera.components.push(new Camera()); //TODO: camera probably shoundlt be a component as its not a behavior of something in the game domain its just a way rendering works. but how is netstate different?

            zone.gameObjects.push(camera);
        }
    }

    onHeroEnterZone(message: ServerHeroEnterZone) {
        console.log("ZoneSystem.onHeroEnterZone", message);

        this.zoneTag = message.zoneTag;
        this.myGameObjectId = message.myGameObjectId;

        let zone = this.zone;

        let map = GameObjectDatabase.createGameObject("map", message);
        zone.gameObjects.push(map);




    }

}