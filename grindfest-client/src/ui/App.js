// @flow
import React, {Component} from 'react';
import LoginScreen from "./LoginScreen";
import GameScreen from "./GameScreen";
import {NetworkManager} from "../network/NetworkManager";
import LoginManager from "../login/LoginManager";


class App extends Component<any, any> {


    constructor() {
        super();
        this.state = {
            loginStatus: LoginManager.loginStatus
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
                {this.state.connectionStatus === "CONNECTED" ? (this.state.loginStatus !== "LOGGED_IN" ? <LoginScreen/> : <GameScreen/>) : <div>Connecting... {NetworkManager.connectionStatus}</div> }
            </div>
        );
    }
}

export default App;
