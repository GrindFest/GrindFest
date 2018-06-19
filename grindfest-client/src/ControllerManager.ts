import {clamp} from "./infrastructure/Math";


export default class ControllerManager {
    static keys: boolean[] = [];
    private static captured: HTMLElement;

    static mouseX: number = 0;
    static mouseY: number = 0;
    static mouseButtons: number = 0;

    static controller1Stick1Direction: number[];
    static controller2Stick1Direction: number[];
    static controller1ButtonA: boolean = false;
    static controller1ButtonAPressed: boolean = false;
    static lastController1ButtonA: boolean = false;



    static update(delta: number) {

        // bind(Player1, ControlKey.MouseMovement, Controls.Stick2);
        //bind(Player1, ControlKey.MouseButton1, Controls.ButtonA);
        // bind(Player1, ControlKey.KeyQ, Controls.ButtonB);
        // bind(Player1, ControlKey.WSAD, Controls.Stick1);

        //bind(Controls.Stick1, Action.Move)
        //bind(Controls.Stick1, Action.Look) // bind look to same stick?
        //bind(Controls.Stick2, Action.Look) // bind it also to stick2 so its overriden by its output if its not 0
        //bind(Controls.ButtonA, Action.Skill1)
        //bind(Controls.ButtonB, Action.Skill2)

        ControllerManager.controller1Stick1Direction = null;
        let player1Stick1Strength = 1;

        let player1Stick2Direction = null;
        let player1Stick2Strength = 1;

        //if ()

        if (this.mouseButtons === 1) {
            ControllerManager.controller1ButtonA = true;
            if (ControllerManager.lastController1ButtonA == false) {
                ControllerManager.controller1ButtonAPressed = true;
            } else {
                ControllerManager.controller1ButtonAPressed = false;
            }
        } else {
            ControllerManager.controller1ButtonA = false;
        }

        ControllerManager.lastController1ButtonA = ControllerManager.controller1ButtonA;


        player1Stick2Direction = Math.atan2(
            (ControllerManager.captured.clientHeight / 2) - ControllerManager.mouseY,
            (ControllerManager.captured.clientWidth / 2) - ControllerManager.mouseX);


        {
            ControllerManager.controller2Stick1Direction = [
                    clamp(((ControllerManager.mouseX - (ControllerManager.captured.clientWidth / 2)) / ControllerManager.captured.clientWidth) * 5, -1, 1),
                    clamp(((ControllerManager.mouseY - (ControllerManager.captured.clientHeight / 2)) / ControllerManager.captured.clientHeight) * 5, -1, 1)];

        }

        {
            //if (actions.keys == Mouse)
            // if (ControllerManager.mouseButtons == 2) {
            //     axes = [
            //         clamp(((ControllerManager.mouseX - (ControllerManager.captured.clientWidth / 2)) / ControllerManager.captured.clientWidth) * 5, -1, 1),
            //         clamp(((ControllerManager.mouseY - (ControllerManager.captured.clientHeight / 2)) / ControllerManager.captured.clientHeight) * 5, -1, 1)];
            // }
        }

        {
            // if (action.keys == WSAD) {
            let axes = [0, 0];
            if (ControllerManager.keys["KeyD"] && ControllerManager.keys["KeyS"]) {axes[0] = 1; axes[1] = 1; }
            else if (ControllerManager.keys["KeyW"] && ControllerManager.keys["KeyD"]) {axes[0] = 1; axes[1] = -1;}
            else if (ControllerManager.keys["KeyS"] && ControllerManager.keys["KeyA"]) {axes[0] = -1; axes[1] = 1;}
            else if (ControllerManager.keys["KeyA"] && ControllerManager.keys["KeyW"]) {axes[0] = -1; axes[1] = -1;}
            else if (ControllerManager.keys["KeyD"]) {axes[0] = 1; axes[1] = 0}
            else if (ControllerManager.keys["KeyS"]) {axes[0] = 0; axes[1] = 1}
            else if (ControllerManager.keys["KeyA"]) {axes[0] = -1; axes[1] = 0}
            else if (ControllerManager.keys["KeyW"]) {axes[0] = 0; axes[1] = -1}
            ControllerManager.controller1Stick1Direction = axes;
        }


        //  }
    }

    static release(element: HTMLElement) {
        this.captured = null;
        element.onkeydown = null;
        element.onkeyup = null;
    }

    static capture(element: HTMLElement) {
        this.captured = element;
        element.oncontextmenu = (e) => {
            return false;
        };

        element.onkeydown = (e) => {
            ControllerManager.keys[e.code] = true;
        };

        element.onkeyup = (e) => {
            ControllerManager.keys[e.code] = false;
        };

        element.onmousemove = (e) => {
            ControllerManager.mouseX = e.clientX;
            ControllerManager.mouseY = e.clientY;
        };
        element.onmousedown = (e) => {
            ControllerManager.mouseButtons = e.buttons;
        };
        element.onmouseup = (e) => {
            ControllerManager.mouseButtons = e.buttons;
        };
    }
}