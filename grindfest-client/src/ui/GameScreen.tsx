import * as React from 'react';
import Game from "../game/Game";
import RenderingSystem from "../world/rendering/RenderingSystem";
import {Component} from "react";
import ZoneSystem from "../world/zone/ZoneSystem";
import ControllerManager from "../ControllerManager";
import ControllerSystem from "../world/controls/ControlsSystem";
import MobileSystem from "../world/movement/MobileSystem";
import ZoneManager from "../infrastructure/world/ZoneManager";
import Zone from "../infrastructure/world/Zone";
import TimerSystem from "../world/TimerSystem";
import {ParticleSystem} from "../world/rendering/ParticleSystem";
import GameObjectDatabase from "../world/GameObjectDatabase";
import {GameSession, GameState} from "../game/GameSession";
import ContentManager from "../content/ContentManager";

export default class GameScreen extends Component<any, { gameState: GameState }> {

    canvas: HTMLCanvasElement;

    constructor(props, context) {
        super(props, context);

        this.state = {
            gameState: null
        }
    }

    async componentDidMount() {

        GameSession.instance.gameStateChanged.register((gameState) => this.setState({gameState: gameState}));

        // Preload everything
        //TODO: do it in asychronous way with loading indicators
        await ContentManager.instance.loadEffect("effects/windSlashLarge.json");
        await ContentManager.instance.load("images/heart.png");
        await ContentManager.instance.loadSpriteSheet("sprites/hero.json");
        await ContentManager.instance.loadSpriteSheet("sprites/golem.json");

        let game = new Game();
        game.initialize();


        let zone = new Zone();
        // zone.tag =
        zone.gameSystems.push(new RenderingSystem(this.canvas.getContext("2d")));
        zone.gameSystems.push(new ZoneSystem());
        zone.gameSystems.push(new ControllerSystem());
        zone.gameSystems.push(new MobileSystem());
        zone.gameSystems.push(new TimerSystem());
        zone.gameSystems.push(new ParticleSystem());
        ZoneManager.zones.push(zone);

        let mapObjects = GameObjectDatabase.createFromMap(await ContentManager.instance.loadTileMap(GameSession.instance.zoneTag));
        for (let gameObject of mapObjects) {
            zone.gameObjects.push(gameObject);
        }

        GameSession.instance.ready();

        ControllerManager.capture(this.canvas)
    }

    componentWillUnmount() {
        ControllerManager.release(this.canvas);
    }

    render() {
        return (
            <div>
                {this.state.gameState == GameState.LoadingZone ? "Loading zone..." : ""}
                <canvas ref={(ref) => this.canvas = ref} width={600} height={600} style={{border: "1px solid black"}}/>
            </div>
        );
    }
}

