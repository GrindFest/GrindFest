import * as React from 'react';
import Game from "../game/Game";
import RenderingSystem from "../world/rendering/RenderingSystem";
import ContentSystem from "../world/ContentSystem";
import {Component} from "react";
import ZoneSystem from "../world/zone/ZoneSystem";
import NetworkManager from "../network/NetworkManager";
import {ClientGameReady, MessageId} from "../infrastructure/network/Messages";
import ControllerManager from "../ControllerManager";
import ControllerSystem from "../world/controls/ControlsSystem";
import MobileSystem from "../world/movement/MobileSystem";
import ZoneManager from "../infrastructure/world/ZoneManager";
import Zone from "../infrastructure/world/Zone";
import TimerSystem from "../world/TimerSystem";
import {ParticleSystem} from "../world/rendering/ParticleSystem";

export default class GameScreen extends Component {

    canvas: HTMLCanvasElement;

    componentDidMount() {


        let game = new Game();
        game.initialize();


        let zone = new Zone();
        zone.gameSystems.push(new ContentSystem());
        zone.gameSystems.push(new RenderingSystem(this.canvas.getContext("2d")));
        zone.gameSystems.push(new ZoneSystem());
        zone.gameSystems.push(new ControllerSystem());
        zone.gameSystems.push(new MobileSystem());
        zone.gameSystems.push(new TimerSystem());
        zone.gameSystems.push(new ParticleSystem());
        ZoneManager.zones.push(zone);


        NetworkManager.send({
            id: MessageId.CMSG_GAME_READY
        } as ClientGameReady); //TODO: this simulates connecting to the zone server

        this.canvas.tabIndex = 1000;
        this.canvas.style.outline = "none";
        this.canvas.focus();
        ControllerManager.capture(this.canvas)
    }

    componentWillUnmount() {
        ControllerManager.release(this.canvas);
    }

    render() {
        return (
            <canvas ref={ (ref) => this.canvas = ref} width={600} height={600} style={{border: "1px solid black"}} />
        );
    }
}

