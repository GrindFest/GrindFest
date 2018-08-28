import GameSystem from "../../infrastructure/world/GameSystem";
import {
    AttributeId,
    MessageId, ServerAttributeSet, ServerGameObjectEnterZone,
    ServerGameObjectLeaveZone,
    ServerEnterZone
} from "../../infrastructure/network/Messages";
import NetworkManager from "../../network/NetworkManager";
import Camera from "../rendering/Camera";
import Transform from "../Transform";
import GameObject from "../../infrastructure/world/GameObject";
import Controllable from "../controls/Controllable";
import Mobile from "../movement/Mobile";
import GameObjectDatabase from "../GameObjectDatabase";
import ControlsSystem from "../controls/ControlsSystem";
import {GameSession} from "../../game/GameSession";

export default class ZoneSystem extends GameSystem {


    private mobiles: Mobile[] = [];

    zoneTag: string; // Client can be in only one zone
    myGameObjectId: number;


    constructor() {
        super();

        this.registerNodeJunction(this.mobiles, Mobile);

        NetworkManager.instance.registerHandler(MessageId.SMSG_GO_ENTER_ZONE, this.onActorEnterZone.bind(this));
        NetworkManager.instance.registerHandler(MessageId.SMSG_GO_LEAVE_ZONE, this.onActorLeaveZone.bind(this));

        NetworkManager.instance.registerHandler(MessageId.SMSG_ATTRIBUTE_SET, this.onAttributeSet.bind(this));

    }

    onAttributeSet(message: ServerAttributeSet) {
        let go = this.findGameObjectById(message.goId);

        for (let change of message.changes) {
            go.set(change.attributeId, change.value); //TODO: should some interpolation happen here? based on attributetemplate[attributeid].interpolation
        }

    }



    onActorLeaveZone(message: ServerGameObjectLeaveZone) {
        let go = this.findGameObjectById(message.goId);
        this.zone.gameObjects.remove(go);
    }

    onActorEnterZone(message: ServerGameObjectEnterZone) {
        console.log("ZoneSystem.onActorEnterZone", message);

        let zone = this.zone;

        //TODO: call gameobjectdatabase.createobject and use data from message as definition
        let actor = GameObjectDatabase.instance.createGameObject("actor", message);



        if (message.isYou) { // If this is me attach camera to me
            GameSession.instance.myGameObjectId = message.goId;

            actor.components.get(Controllable).isLocal = true;

            //TODO: move to gameObjectDatase
            let camera = new GameObject();
            camera.components.push(new Transform(0, -16, actor.components.get(Transform))); //TODO: weird hardcoded value based on size of player sprite
            camera.components.push(new Camera()); //TODO: camera probably shoundlt be a component as its not a behavior of something in the game domain its just a way rendering works. but how is netstate different?

            zone.gameObjects.push(camera)

        }

        zone.gameObjects.push(actor);


        let controlSystem = zone.gameSystems.find( (gs) => gs instanceof ControlsSystem) as ControlsSystem;
        if (message.velocity.x == 0 && message.velocity.y == 0) {
            controlSystem.startIdle(actor.components.get(Controllable));
        } else {
            controlSystem.startMoving(actor.components.get(Controllable), message.velocity);
        }

    }



}