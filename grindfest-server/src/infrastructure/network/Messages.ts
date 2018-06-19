import {Vector2} from "../Math";

export enum PowerType {
    Use,
    Channeling,
    Passive
}

export interface PowerDefinition {
    tag: string;
    type: PowerType;
    animationTag: string;
    duration: number;
}

export enum Direction  {
    Left = 0,
    Up = 1,
    Right = 2,
    Down = 3,
}
export enum MessageId {
    CMSG_LOGIN_REQUEST = 1,
    SMSG_LOGIN_RESPONSE = 2,
    SMSG_HERO_ENTER_ZONE = 3,
    SMSG_GO_ENTER_ZONE = 4,
    SMSG_MOBILE_MOVE = 5,
    CMSG_GAME_READY = 6,
    SMSG_GO_LEAVE_ZONE = 7,
    CMSG_MOVE_REQUEST = 8,
    CMSG_POWER_USE = 9,
    SMSG_GO_PLAY_ANIMATION = 10,
    SMSG_FLOATING_NUMBER = 11,
}

export enum AttributeId {
    HitPoints,
    FireDamage,
    FireResist,
}

export enum FloatingNumberType {
    White,
    Red,
    RedCritical,
}

export interface ServerFloatingNumber {
    id: MessageId.SMSG_FLOATING_NUMBER;
    goId: number;
    value: number;
    type: FloatingNumberType;
}

export interface ServerGameObjectPlayAnimation {
    id: MessageId.SMSG_GO_PLAY_ANIMATION;
    goId: number;
    animationTag: string;
    duration: number;
}

export interface ClientPowerUse {
    id: MessageId.CMSG_POWER_USE;
    powerTag: string;
    targetGameObjectId?: number;
    targetDirection?: number;
}

export enum LoginStatus  {
    OK = 1,
    InvalidCredentials = 2,
    AlreadyLoggedIn = 3,
}
export interface ServerMobileMove extends Message {
    id: MessageId.SMSG_MOBILE_MOVE;
    goId: number;
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

export interface ServerHeroEnterZone extends Message {
    id: MessageId.SMSG_HERO_ENTER_ZONE;
    zoneTag: string;
    //zoneType: ZoneType; // Preset | Generated
    myGameObjectId: number;
}

export interface ServerGameObjectLeaveZone extends Message {
    id: MessageId.SMSG_GO_LEAVE_ZONE;
    goId: number;
}

export interface ServerGameObjectEnterZone extends Message {
    id: MessageId.SMSG_GO_ENTER_ZONE;
    goId: number;
    x: number;
    y: number;
    spriteAsset: string;
    velocity: Vector2;
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
