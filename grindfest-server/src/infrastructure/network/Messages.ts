import {Vector2} from "../Math";

export enum AnimationTag {
    Idle = "idle",
    Walk = "walk",
    Spellcast = "spellcast",
}

export enum PowerTag {
    Slash,
    GolemStomp,
}
export enum PowerAttribute {
    Duration,
    AnimationTag,
    Combo0AnimationTag,
    Combo1AnimationTag,
    Combo2AnimationTag,

    IsComboPower,
    IsChanneled,

    TargetEnemies,
    Range,

    // Slash
    Damage,
    SlashArc1Length,

}

export enum PowerType {
    Use,
    Channeling,
    Passive
}

export interface PowerDefinition {
    tag: PowerTag;

    //attributes: Map<PowerAttribute, ( attributeId: AttributeId) =>  number>;
    attributes: any; //TODO: use map when loading is implemented?
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
    SMSG_ENTER_ZONE = 3, //TODO: should this be called change zone?
    SMSG_GO_ENTER_ZONE = 4,
    SMSG_MOBILE_MOVE = 5,
    CMSG_GAME_READY = 6,
    SMSG_GO_LEAVE_ZONE = 7,
    CMSG_MOVE_REQUEST = 8,
    CMSG_POWER_USE = 9,
    SMSG_GO_PLAY_ANIMATION = 10,
    SMSG_FLOATING_NUMBER = 11,
    SMSG_ATTRIBUTE_SET = 12,
    SMSG_GO_PLAY_EFFECT = 13,
}


export interface ServerAttributeSet {
    id: MessageId.SMSG_ATTRIBUTE_SET,
    goId: number;
    changes: [{
        attributeId: AttributeId;
        value: number;
    }]
}

export enum AttributeId {
    //TODO: rename to GameObjectAttributeId? and is it Id or Tag?
    HitPoints,
    MaxHitPoints,
    FireDamage,
    FireResist,
    MovementSpeed,
}

export enum FloatingNumberType {
    White,
    Red,
    RedCritical,
}

export interface ServerGameObjectPlayEffect {
    id: MessageId.SMSG_GO_PLAY_EFFECT;
    goId: number;
    effectTag: string;
    direction: number;
}

export interface ServerFloatingNumber { //TODO: is this ServerGameObjectFloatingNumber?
    id: MessageId.SMSG_FLOATING_NUMBER;
    goId: number;
    value: number;
    type: FloatingNumberType;
}

export interface ServerGameObjectPlayAnimation {
    id: MessageId.SMSG_GO_PLAY_ANIMATION;
    goId: number;
    animationTag: AnimationTag;
    direction: number;
    duration: number;
}

export interface ClientPowerUse {
    id: MessageId.CMSG_POWER_USE;
    powerTag: PowerTag;
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

export interface ServerEnterZone extends Message {
    id: MessageId.SMSG_ENTER_ZONE;
    zoneTag: string;
    //zoneType: ZoneType; // Preset | Generated
}

export interface ServerGameObjectLeaveZone extends Message {
    id: MessageId.SMSG_GO_LEAVE_ZONE;
    goId: number;
}

export interface ServerGameObjectEnterZone extends Message {
    id: MessageId.SMSG_GO_ENTER_ZONE;
    goId: number;

    //TODO: are all of these attributes?
    x: number;
    y: number;
    spriteAsset: string;
    velocity: Vector2;

    isYou?: boolean;

    attributes: {attributeId: AttributeId, value: number}[]
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
