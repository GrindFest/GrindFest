// @flow
import EventEmitter from "../infrastructure/EventEmitter";
import {NetworkManager} from "../network/NetworkManager";
import {MessageId} from "../infrastructure/network/Messages";

export default class LoginManager {

    static loginStatusChanged = new EventEmitter();
    static loginStatus = null;

    constructor() {

    }


    static login(username: string, password: string) {
        console.log("LoginManager.login", username);
        NetworkManager.send({
            id: MessageId.CMSG_LOGIN_REQUEST,
            username: username,
            password: password
        });
    }

    static initialize() {
        NetworkManager.registerHandler(MessageId.SMSG_LOGIN_RESPONSE, (message) => {
            this.loginStatus = message.loginStatus;
            this.loginStatusChanged.emit1(this.loginStatus);
        });

        LoginManager.loginStatus = "NOT_LOGGED";
    }
}