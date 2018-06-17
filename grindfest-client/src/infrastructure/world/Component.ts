import GameObject from "./GameObject";

export interface Node {
    gameObject?: GameObject;
}
export interface Node2<T1, T2> extends Node{
    c1: T1;
    c2: T2;
}
export interface Node3<T1, T2, T3> extends Node2<T1, T2> {
    c3: T3;
}
export interface Node4<T1, T2, T3, T4> extends Node3<T1, T2, T3> {
    c4: T4;
}
export default class Component implements Node {

    public gameObject: GameObject;

    get world() { return this.gameObject.world; }


    sendMessage<T>(payload: T) {
        this.gameObject.sendMessage(payload);
    }


}

