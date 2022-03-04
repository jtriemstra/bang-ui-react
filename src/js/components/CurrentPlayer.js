import React, { Component } from "react";
import ReactDOM from "react-dom";
import Utility from "../Utility";

class CurrentPlayer extends Component {
    constructor(props) {
      super();

      this.handleAction = this.handleAction.bind(this);
      this.handleMulticard = this.handleMulticard.bind(this);
      this.getMulticardChecked = this.getMulticardChecked.bind(this);
      this.getMulticardControls = this.getMulticardControls.bind(this);
      this.getOtherPlayers = this.getOtherPlayers.bind(this);
      this.getHandCards = this.getHandCards.bind(this);

      this.state = {
          lastResponse:null,
          name:null,
          currentHealth:null,
          maxHealth:null,
          roleName:"",
          characterName:"",
          gunName:"",
          messages:null,
          handCards:null
      }
    }

    getPlayerName() {
      if (document.cookie) {
          const cookies = document.cookie.split(";");
          for (var i=0; i<cookies.length; i++){
              if (cookies[i].trim().startsWith("playerName=")){
                  return cookies[i].trim().substring(11);                    
              }
          }
      }
    }
  
    getGameName() {
      if (document.cookie) {
          const cookies = document.cookie.split(";");
          for (var i=0; i<cookies.length; i++){
              if (cookies[i].trim().startsWith("gameName=")){
                  return cookies[i].trim().substring(9);                    
              }
          }
      }
    }

    handleAction(event, actionName, actionData) {
        event.preventDefault();

        let myRequest = new Request(Utility.apiServer() + "/" + actionName);
        let requestInit = Utility.postRequestInit();
        let body = {"playerId":this.getPlayerName(),"gameName":this.getGameName() };
        if (actionData) {
            for (const key of Object.keys(actionData)) {
                body[key] = actionData[key];
            }            
        }
        requestInit.body = JSON.stringify(body);

        fetch(myRequest, requestInit)
        .then(res => res.json())
        .then((result) => {
            this.setState({
                lastResponse:result,
                name:result.state.currentPlayer.name,
                currentHealth:result.state.currentPlayer.currentHealth,
                maxHealth:result.state.currentPlayer.maxHealth,
                roleName:result.state.currentPlayer.role,
                characterName:result.state.currentPlayer.character,
                gunName:result.state.currentPlayer.gun,
                messages:result.state.currentPlayer.messages,
                handCards:result.state.currentPlayer.hand.cards
            });
        });
    }

    getPlayer(player) {
        return <div>
                    <b>Player Name:</b>  {player.name}
                    <b>Health:</b> {player.currentHealth} / {player.maxHealth}
                    <b>Is Sheriff?:</b> {player.sheriff}
                    <b>Character:</b> {player.characterName}
                    <b>Gun:</b> {player.gun}
                    <br></br>
                    
                </div>;
    }
  
    getOtherPlayers() {
        let players = [];
        if (this.state.lastResponse) {
            for (const player of this.state.lastResponse.state.otherPlayers) {
                players.push(<hr></hr>);
                players.push(this.getPlayer(player));
            }
        }
        return players;
    }
  
    handleMulticard(event, actionName) {
        let checkedCards = this.getMulticardChecked();
        let multiCardNames = [];
        let multiCardIds = [];
        for (const check of checkedCards) {
            multiCardNames.push(check.dataset.cardname); 
            multiCardIds.push(check.dataset.cardid); 
        }
        this.handleAction(event,actionName, {"cardNames":multiCardNames, "cardIds":multiCardIds, "actionName":actionName});
    }
 
    getMulticardChecked() {
        return document.querySelectorAll("input.multicard:checked");
    }

    getMulticardControls(array, action, text) { 
        let controls = [];
        for (const c of array) {
            controls.push(<label><input class="multicard" type="checkbox" data-cardname={c.name} data-cardid={c.id} />{c.name}</label>)
        }
        controls.push(<button onClick={(event) => this.handleMulticard(event, action)}>{text}</button>);
        return controls;  
    }  
 
    getActionForm() {
        if (!this.state.lastResponse) {
            return <button onClick={(event) => this.handleAction(event,"wait")}>Wait</button>;
        }   

        let nextActions = this.state.lastResponse.nextActions.split(";");
        let actionControls = [];  
        let actionsHandled = [];  
        
        if (nextActions.indexOf("play") > -1) {
            actionsHandled.push("play");
            let transformedCards = [];
            for (const c of this.state.lastResponse.state.currentPlayer.hand.cards) {
                let cardValid = (this.state.lastResponse.validCards[c.id]);
                let cardDisplayName = !cardValid ? c.name : this.state.lastResponse.validCards[c.id].name;
                transformedCards.push({"id":c.id, "name":cardDisplayName, "isValid":cardValid});                
            } 
            if (this.state.lastResponse.numberOfCardsToDefend && this.state.lastResponse.numberOfCardsToDefend > 1) {
                // TODO: disable invalid cards
                let x = this.getMulticardControls(transformedCards, "play", "Play Selected");
                actionControls.push(x);    
            }
            else {
                for (const c of transformedCards) {
                    actionControls.push(<button disabled={!c.isValid} onClick={(event) => this.handleAction(event,"play", {"cardNames":[c.name],"cardIds":[c.id]})}>Play {c.name}</button>);
                }                
            }
        }   
        if (nextActions.indexOf("draw") > -1) { 
            if (this.state.lastResponse.sourceNames) {
                actionsHandled.push("draw");
                for (const s of this.state.lastResponse.sourceNames) {
                    actionControls.push(<button onClick={(event) => this.handleAction(event,"draw", {"sourceName":s,"numberToDraw":this.state.lastResponse.numberToDraw})}>Draw from {s}</button>);
                }  
            }     
        }   
        if (nextActions.indexOf("chooseCard") > -1) {  
            if (this.state.lastResponse.cards) { 
                actionsHandled.push("chooseCard");  
                if (this.state.lastResponse.numberToChoose == 1) { 
                    for (const c of this.state.lastResponse.cards) {
                        actionControls.push(<button onClick={(event) => this.handleAction(event,"chooseCard", {"cardName":c.name, "cardId":c.id})}>Draw {c.name} from General Store</button>);
                    }
                } else {
                    let x = this.getMulticardControls(this.state.lastResponse.cards, "chooseCard", "Choose Selected");
                    actionControls.push(x);    
                }
            }     
        }     
        if (nextActions.indexOf("chooseTarget") > -1) {
            actionsHandled.push("chooseTarget"); 
            for (const t of this.state.lastResponse.targets) {
                actionControls.push(<button onClick={(event) => this.handleAction(event,"chooseTarget", {"targetId":t})}>Target {t}</button>);
            } 
        }
        if (nextActions.indexOf("discardRule") > -1) {
            actionsHandled.push("discardRule");
            actionControls.push(<button onClick={(event) => this.handleAction(event,"discardRule")}>Start Discard</button>);
        } else if (nextActions.indexOf("discard") > -1 || nextActions.indexOf("discardSidKetchum") > -1) {
            actionsHandled.push("discard");
            actionsHandled.push("discardSidKetchum");
            if (this.state.lastResponse.numberToDiscard == 0) {
                actionControls.push(<button onClick={(event) => this.handleAction(event,"discard", {"cardNames":[], "cardIds":[], "actionName":"discard"})}>Discard Nothing</button>);
            } else {
                let x = this.getMulticardControls(this.state.lastResponse.state.currentPlayer.hand.cards, "discard", "Discard Selected");
                actionControls.push(x);
            }   
        }    
        if (nextActions.indexOf("discardRuleSid") > -1) {
            actionsHandled.push("discardRuleSid");
            actionControls.push(<button onClick={(event) => this.handleAction(event,"discardRule", {"actionName":"discardRuleSid"})}>Discard for Health</button>);
        }
        if (nextActions.indexOf("pass") > -1) {
            actionsHandled.push("pass");
            actionControls.push(<button onClick={(event) => this.handleAction(event,"pass")}>Pass</button>);
        }
        if (nextActions.indexOf("barrel") > -1) { 
            actionsHandled.push("barrel");
            actionControls.push(<button onClick={(event) => this.handleAction(event,"barrel")}>Barrel</button>);
        }
        
        for (const actionName of nextActions) {
            console.log(actionName);
            if (actionsHandled.indexOf(actionName) > -1) {
                console.log("action handled");
            }
            else {
                console.log("action defaulted");
                actionControls.push(<button onClick={(event) => this.handleAction(event,actionName)}>{actionName}</button>);
            }
        }
        
        return actionControls;  
    } 

    getHandCards() {
        let cardMarkup = [];
        if (this.state.handCards) {
            for (const c of this.state.handCards) {
                cardMarkup.push(<span> ({c.name}) </span>);
            }
        }
        return cardMarkup;
    }

    render() {
        let actionForm = this.getActionForm();
        let otherPlayers = this.getOtherPlayers();
        let handCards = this.getHandCards();
        
        return (
            <div>
                <b>Player Name:</b>  {this.state.name}
                <b>Health:</b> {this.state.currentHealth} / {this.state.maxHealth}
                <b>Role:</b> {this.state.roleName}
                <b>Character:</b> {this.state.characterName}
                <b>Gun:</b> {this.state.gunName}
                <br></br>
                {handCards}
                <br></br>
                <b>Messages:</b>{this.state.messages}
                <form>
                    {actionForm}
                </form>
                {otherPlayers}
            </div>
        )
    }
}

export default CurrentPlayer;