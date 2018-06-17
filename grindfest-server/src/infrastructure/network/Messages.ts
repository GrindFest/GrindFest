import {Vector2} from "../Math";

export enum PowerType {
    Use,
    Channeling,
    Passive
}

export interface PowerDefinition {
    tag: string;
    type: PowerType
}

export enum Direction  {
    Up = 0,
    Right = 1,
    Down = 2,
    Left = 3,
}
export enum MessageId {
    CMSG_LOGIN_REQUEST = 1,
    SMSG_LOGIN_RESPONSE = 2,
    SMSG_ENTER_ZONE = 3,
    SMSG_ACTOR_ENTER_ZONE = 4,
    SMSG_ACTOR_MOVE = 5,
    CMSG_GAME_READY = 6,
    SMSG_ACTOR_LEAVE_ZONE = 7,
    CMSG_MOVE_REQUEST = 8,
    CMSG_POWER_USE = 9,
    SMSG_ACTOR_PLAY_ANIMATION = 10,
    SMSG_FLOATING_NUMBER = 11,
}


export interface ServerActorPlayAnimation {
    id: MessageId.SMSG_ACTOR_PLAY_ANIMATION
    actorId: number;
    animationTag: string;
    duration: number;
}

export interface ClientPowerUse {
    id: MessageId.CMSG_POWER_USE
    powerTag: string;
    targetActorId?: number;
    targetDirection?: number;
}

export enum LoginStatus  {
    OK = 1,
    InvalidCredentials = 2,
    AlreadyLoggedIn = 3,
}
export interface ServerActorMove extends Message {
    id: MessageId.SMSG_ACTOR_MOVE;
    actorId: number;
    movement: Vector2;
    position: Vector2;
}

export interface ClientMovementRequest extends Message {
    id: MessageId.CMSG_MOVE_REQUEST;
    movement: Vector2;
    expectedPosition: Vector2;
}

export interface ClientGameReady extends Message {
    id: MessageId.CMSG_GAME_READY;
}

export interface ServerEnterZone extends Message {
    id: MessageId.SMSG_ENTER_ZONE;
    zoneTag: string;
    //zoneType: ZoneType; // Preset | Generated
    myActorId: number;
}

export interface ServerActorLeaveZone extends Message {
    id: MessageId.SMSG_ACTOR_LEAVE_ZONE;
    actorId: number;
}

export interface ServerActorEnterZone extends Message {
    id: MessageId.SMSG_ACTOR_ENTER_ZONE;
    zoneTag: string;
    actorId: number;
    x: number;
    y: number;
    spriteAsset: string;
    velocity: Vector2;
}

export interface ServerActorMove extends Message {
    id: MessageId.SMSG_ACTOR_MOVE;
    actorId: number;
    direction: number;

}

export interface ServerLoginResponse extends Message {
    id: MessageId.SMSG_LOGIN_RESPONSE;
    loginStatus: LoginStatus
}


export interface ClientLoginRequest {
    id: MessageId.CMSG_LOGIN_REQUEST;
    username: string;
    password: string;
}

export interface Message {
    id: number;
}
