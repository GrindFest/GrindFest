import * as React from 'react';
import LoginScreen from "./LoginScreen";
import GameScreen from "./GameScreen";
import NetworkManager from "../network/NetworkManager";
import LoginManager from "../login/LoginManager";
import {Component} from 'react';
import {LoginStatus} from "../infrastructure/network/Messages";
import {GameSession, GameState} from "../game/GameSession";

export default class App extends Component<any, {loginStatus: LoginStatus, connectionStatus: string, gameState: GameState}> {


    constructor(props: any, context?: any) {
        super(props);
        this.state = {
            connectionStatus: null,
            loginStatus: null,
            gameState: GameState.NotInGame,
        };


    }

    componentWillUnmount() {
        /*this.loginStatusChangedHandler.off();*/
    }

    componentDidMount() {

        NetworkManager.instance.initialize();
        LoginManager.instance.initialize();
        GameSession.instance.initialize();

        NetworkManager.instance.connectionStatusChanged.register((connectionStatus) => {
            this.setState({
                connectionStatus: connectionStatus
            });
        });

        /*this.loginStatusChangedHandler =*/
        LoginManager.instance.loginStatusChanged.register((loginStatus) => {
            this.setState({
                loginStatus: loginStatus
            });
        });

        GameSession.instance.gameStateChanged.register( (gameState) => {


            this.setState({
                gameState: gameState
            })
        })

    }

    render() {
        if (this.state.connectionStatus === "CONNECTED") {
            if (this.state.loginStatus !== LoginStatus.OK) {
                return <LoginScreen/>;
            } else {
                if (this.state.gameState != GameState.NotInGame) {
                    return <GameScreen/>;
                } else {
                    return "Waiting for game server..."
                }
            }
        } else {
            return <div>Connecting... {NetworkManager.instance.connectionStatus}</div>;
        }
    }
}
