import React, { Component } from "react";
import ReactDOM from "react-dom";
import CurrentPlayer from "./CurrentPlayer"
import Start from "./Start"

class BangUi extends Component {
    constructor(props) {
      super();
    }

    render() {
        return (
            <div>
                <Start />
                <CurrentPlayer />
            </div>            
        )
    }
}

export default BangUi;