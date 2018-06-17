import EventEmitter from "../infrastructure/EventEmitter";
import NetworkManager from "../network/NetworkManager";
import {ClientLoginRequest, LoginStatus, MessageId, ServerLoginResponse} from "../infrastructure/network/Messages";

export default class LoginManager {

    static loginStatusChanged = new EventEmitter();
    static loginStatus: LoginStatus = null;

    constructor() {

    }


    static login(username: string, password: string) {
        console.log("LoginManager.login", username);
        NetworkManager.send({
            id: MessageId.CMSG_LOGIN_REQUEST,
            username: username,
            password: password
        } as ClientLoginRequest);
    }

    //@messageHandler(MessageId.SMSG_LOGIN_RESPONSE)
    static onLoginResponse(message: ServerLoginResponse) {
        LoginManager.loginStatus = message.loginStatus;
        LoginManager.loginStatusChanged.emit1(LoginManager.loginStatus);
    }

    static initialize() {
        NetworkManager.registerHandler(MessageId.SMSG_LOGIN_RESPONSE, LoginManager.onLoginResponse);
    }
}