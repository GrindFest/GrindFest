// @flow

import World from "./World";
import Component from "./Component";
import GameObject from "./GameObject";

export default /*abstract*/ class GameSystem {

    world: World;

    registeredComponents: Map<Class<Component>, Component[]> = new Map();

    update(delta: number) {

    }

    draw(delta: number) {

    }

    onGameObjectAdded(gameObject: GameObject): void {

        for (let component of gameObject.components) {
            let componentType = component.constructor;
            if (this.isRegistered(componentType)) {

                let array = this.registeredComponents.get(componentType);

                array.push(component);
            }
        }
    }

    beforeGameObjectAdded(gameObject: GameObject) {

    }
    afterGameObjectAdded(gameObject: GameObject) {

    }

    removeGameObject(gameObject: GameObject): void {

        for (let component of gameObject.components) {
            if (this.isRegistered(component.constructor)) {
                let array = this.registeredComponents.get(component.constructor);

                array.splice(array.indexOf(component), 1);
            }
        }
    }

    isRegistered<T: Component>(componentType: Class<T>): boolean {
        return this.registeredComponents.has(componentType);
    }


    registerComponent<T: Component>(array: Array<T>, componentType: Class<T>) {
        this.registeredComponents.set(componentType, array);
    }
}