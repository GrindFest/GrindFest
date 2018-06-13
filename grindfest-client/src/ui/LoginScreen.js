import React, {Component} from "react";
import Debug from "../game/Debug";
import LoginManager from "../login/LoginManager";

export default class LoginScreen extends Component {

    constructor() {
        super();
        this.state = {
            username: "",
            password: "",
        };


        this.onLoginClick = this.onLoginClick.bind(this);
    }


    render() {
        return (<div>
            {this.state.username}
            Account: <input defaultValue={this.state.username} type="text" onChange={ (input) => this.setState({username: input.value})}/>
            <br/>
            Password: <input defaultValue={this.state.password}  type="text"  onChange={ (input) => this.setState({password: input.value})}/>
            <br />
            <button onClick={() => this.onLoginClick()}>Login</button>
        </div>)
    }


    onLoginClick() {
        //login(this.state.username, this.state.password)
    }


    componentDidMount() {

        if (Debug.AUTO_LOGIN) {
            LoginManager.login(Debug.AUTO_LOGIN_USERNAME, Debug.AUTO_LOGIN_PASSWORD);
        }
    }
}