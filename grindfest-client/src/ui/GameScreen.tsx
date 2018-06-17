import * as React from 'react';
import Game from "../game/Game";
import RenderingSystem from "../world/rendering/RenderingSystem";
import World from "../infrastructure/world/World";
import ContentSystem from "../world/ContentSystem";
import WorldManager from "../infrastructure/world/WorldManager";
import {Component} from "react";
import ZoneSystem from "../world/zone/ZoneSystem";
import NetworkManager from "../network/NetworkManager";
import {ClientGameReady, MessageId} from "../infrastructure/network/Messages";
import ControllerManager from "../ControllerManager";
import ControllerSystem from "../world/ControlsSystem";
import MobileSystem from "../world/movement/MobileSystem";
import EffectSystem from "../world/EffectSystem";

export default class GameScreen extends Component {

    canvas: HTMLCanvasElement;

    componentDidMount() {


        let game = new Game();
        game.initialize();


        let world = new World();
        world.gameSystems.push(new ContentSystem());
        world.gameSystems.push(new RenderingSystem(this.canvas.getContext("2d")));
        world.gameSystems.push(new ZoneSystem());
        world.gameSystems.push(new ControllerSystem());
        world.gameSystems.push(new MobileSystem());
        world.gameSystems.push(new EffectSystem());
        WorldManager.worlds.push(world);


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

