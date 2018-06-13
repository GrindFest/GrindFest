// @flow

const MessageId = {
    CMSG_LOGIN_REQUEST: 1,
    SMSG_LOGIN_RESPONSE: 2,
    SMSG_ENTER_ZONE: 3,
    SMSG_ACTOR_ENTER_ZONE: 4,
};

export interface ServerMessageEnterZone {
    zoneId: number,
    actorId: number,
    zoneType: "PRESET" | "GENERATED"
}

export interface ClientLoginRequestMessage {
    username: string;
    password: string;
}

export interface Message {
    id: number;
}

export { MessageId };