import BangUi from "./js/components/BangUi";
import React, { Component } from "react";
import ReactDOM from "react-dom";


const wrapper = document.getElementById("container");
wrapper ? ReactDOM.render(<BangUi  />, wrapper) : false;