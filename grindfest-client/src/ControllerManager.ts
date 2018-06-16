

export default class ControllerManager {
    static keys: boolean[] = [];
    private static captured: HTMLElement;

    static mouseX: number = 0;
    static mouseY: number = 0;
    static mouseButtons: number = 0;

    static controller1Stick1Direction: number;
    static controller1ButtonA: boolean;



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
        } else {
            ControllerManager.controller1ButtonA = false;
        }

        player1Stick2Direction = Math.atan2(
            (ControllerManager.captured.clientHeight / 2) - ControllerManager.mouseY,
            (ControllerManager.captured.clientWidth / 2) - ControllerManager.mouseX);


        // if (action.keys == WSAD) {
        let direction;
        if (ControllerManager.keys["KeyD"] && ControllerManager.keys["KeyS"]) direction = Math.PI / 4;
        else if (ControllerManager.keys["KeyW"] && ControllerManager.keys["KeyD"]) direction = Math.PI + Math.PI / 2 + Math.PI / 4;
        else if (ControllerManager.keys["KeyS"] && ControllerManager.keys["KeyA"]) direction = Math.PI / 2 + Math.PI / 4;
        else if (ControllerManager.keys["KeyA"] && ControllerManager.keys["KeyW"]) direction = Math.PI + Math.PI / 4;
        else if (ControllerManager.keys["KeyD"]) direction = 0;
        else if (ControllerManager.keys["KeyS"]) direction = Math.PI / 2;
        else if (ControllerManager.keys["KeyA"]) direction = Math.PI;
        else if (ControllerManager.keys["KeyW"]) direction = Math.PI + Math.PI / 2;

        ControllerManager.controller1Stick1Direction = direction;
        //  }
    }

    static release(element: HTMLElement) {
        this.captured = null;
        element.onkeydown = null;
        element.onkeyup = null;
    }

    static capture(element: HTMLElement) {
        this.captured = element;
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