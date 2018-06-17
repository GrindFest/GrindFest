import * as React from 'react';
import LoginScreen from "./LoginScreen";
import GameScreen from "./GameScreen";
import NetworkManager from "../network/NetworkManager";
import LoginManager from "../login/LoginManager";
import {Component} from 'react';
import {LoginStatus} from "../infrastructure/network/Messages";

export default class App extends Component<any, {loginStatus: LoginStatus, connectionStatus: string}> {


    constructor(props: any, context?: any) {
        super(props);
        this.state = {
            connectionStatus: null,
            loginStatus: null
        };


    }

    componentWillUnmount() {
        /*this.loginStatusChangedHandler.off();*/
    }

    componentDidMount() {
        NetworkManager.initialize();
        LoginManager.initialize();
        NetworkManager.connectionStatusChanged.register((connectionStatus) => {
            this.setState({
                connectionStatus: connectionStatus
            });
        });

        /*this.loginStatusChangedHandler =*/
        LoginManager.loginStatusChanged.register((loginStatus) => {
            this.setState({
                loginStatus: loginStatus
            });
        });

    }

    render() {
        return (
            <div>
                {this.state.connectionStatus === "CONNECTED" ? (this.state.loginStatus !== LoginStatus.OK ? <LoginScreen/> : <GameScreen/>) : <div>Connecting... {NetworkManager.connectionStatus}</div> }
            </div>
        );
    }
}
