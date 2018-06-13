// @flow
import React, { Component } from 'react';
import Game from "../game/Game";
import RenderingSystem from "../world/systems/RenderingSystem";
import GameObject from "../infrastructure/world/GameObject";
import Transform from "../world/components/Transform";
import Sprite from "../world/components/Sprite";
import Camera from "../world/components/Camera";
import World from "../infrastructure/world/World";
import ContentSystem from "../world/systems/ContentSystem";
import WorldManager from "../infrastructure/world/WorldManager";

export default class GameScreen extends Component {

    canvas;

    componentDidMount() {

        let game = new Game();

        game.initialize();


        let world = new World();
        world.gameSystems.push(new ContentSystem());
        world.gameSystems.push(new RenderingSystem());
        WorldManager.worlds.push(world);

        {
            let hero = new GameObject();
            hero.components.push(new Transform());
            hero.components.push(new Sprite("/sprites/body/male/Light.json"));
            world.gameObjects.push(hero);
        }
        {
            let hero = new GameObject();
            hero.components.push(new Transform(64, 128));
            hero.components.push(new Sprite("/sprites/body/male/Light.json"));
            world.gameObjects.push(hero);
        }


        let camera = new GameObject();
        camera.components.push(new Transform());
        camera.components.push(new Camera(this.canvas.getContext("2d")));

        world.gameObjects.push(camera);

    }

    render() {
        return (
            <canvas ref={ (ref) => this.canvas = ref} width={600} height={600} style={{border: "1px solid black"}} />
        );
    }
}

