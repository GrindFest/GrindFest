import EventEmitter from "../infrastructure/EventEmitter";
import NetworkManager from "../network/NetworkManager";
import {
    ClientLoginRequest,
    LoginStatus,
    MessageId,
    ServerEnterZone,
    ServerLoginResponse
} from "../infrastructure/network/Messages";
import GameObjectDatabase from "../world/GameObjectDatabase";
import ContentManager from "../content/ContentManager";
import {GameSession} from "../game/GameSession";

export default class LoginManager {

    static instance = new LoginManager();
    
    loginStatusChanged = new EventEmitter();
    loginStatus: LoginStatus = null;
    myGameObjectId: number;

    constructor() {

    }


    static login(username: string, password: string) {
        console.log("LoginManager.login", username);
        NetworkManager.instance.send({
            id: MessageId.CMSG_LOGIN_REQUEST,
            username: username,
            password: password
        } as ClientLoginRequest);
    }

    //@messageHandler(MessageId.SMSG_LOGIN_RESPONSE)
    onLoginResponse(message: ServerLoginResponse) {
        this.loginStatus = message.loginStatus;
        this.loginStatusChanged.emit1(this.loginStatus);
    }



    initialize() {
        NetworkManager.instance.registerHandler(MessageId.SMSG_LOGIN_RESPONSE, this.onLoginResponse.bind(this));
    }
}