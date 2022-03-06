import React, { Component } from "react";
import ReactDOM from "react-dom";
import Utility from "../Utility";

class Start extends Component {
    constructor(props) {
      super();

      this.handleNewGame = this.handleNewGame.bind(this);
      this.handleJoinGame = this.handleJoinGame.bind(this);
      this.handleStartGame = this.handleStartGame.bind(this);
    }

    handleNewGame(event) {
        event.preventDefault();

        let splashForm = event.target.closest("form");

        this.loadGame(splashForm.querySelector("#playerName").value, "create");
    }

    handleJoinGame(event) {
        event.preventDefault();

        let splashForm = event.target.closest("form");

        this.loadGame(splashForm.querySelector("#playerName").value, "join", splashForm.querySelector("#gameName").value);
    }

    handleStartGame(event) {
        event.preventDefault(); 

        let splashForm = event.target.closest("form");
 
        var myRequest = new Request(Utility.apiServer() + "/start");
        var requestInit = Utility.postRequestInit();
        requestInit.body = JSON.stringify({"gameId":splashForm.querySelector("#gameId").value });

        fetch(myRequest, requestInit)
        //.then(res => res.json())
        //.then((result) => {
        .then(() => {
            //this.props.onGameStart(result, playerName);
        }); 
    } 

    loadGame(playerName, action, gameName) { 

        var myRequest = new Request(Utility.apiServer() + "/" + action);
        var requestInit = Utility.postRequestInit();
        requestInit.body = JSON.stringify({"playerName":playerName,"gameName":gameName });

        fetch(myRequest, requestInit)
        .then(res => res.json())
        .then((resultJson) => {
            document.cookie = "playerName=" + playerName;
            document.cookie = "gameName=" + (gameName ? gameName : playerName);
            document.querySelector("#gameId").value = resultJson.id;
            //this.props.onGameStart(result, playerName);
        });
    }

    render() {
        return (
            <form>
                Player: <input type="text" name="playerName" id="playerName" />
                Game: <input type="text" name="gameName" id="gameName" />
                <button onClick={(event) => this.handleNewGame(event)} >New Game</button>
                <button onClick={(event) => this.handleJoinGame(event)} >Join Game</button>
                <button onClick={(event) => this.handleStartGame(event)} >Start Game</button>
                <input type="text" name="gameId" id="gameId" />
            </form>
        )
    }
}

export default Start;