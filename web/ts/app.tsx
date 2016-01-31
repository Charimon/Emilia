import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Radium from 'radium';
import * as RetinaImage from 'react-retina-image';
import * as color from 'color';
import { Router, Route, Link, browserHistory } from 'react-router'

var Parse = require('parse').Parse;
import * as ParseReact from 'parse-react';
var ParseComponent = ParseReact.Component(React);

import {config} from './config'

const globalStyle = { 
  html: {
    margin: 0,
    padding: 0,
    height: "100%",
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' 
  },  
  body: {
    margin: 0,
    padding: 0,
    height: "100%"
  },  
  "#app": {
    height: "100%"
  }
}


;

Parse.initialize(config.parse.applicationId, config.parse.jsKey);

class User extends React.Component<{}, {}> {
  render() {
    
    return <div style={{display:"flex", flexDirection:"column", height: "100%"}}>
      <Radium.Style rules= { globalStyle } />
      USER:
    </div>
  }
  did() {
    debugger;
  }
}

class App extends React.Component<any, {}> {
  render() {
    var props = this.props.location;
    
    return <div style={{display:"flex", flexDirection:"column", height: "100%"}}>
      <Radium.Style rules= { globalStyle } />
      APP
    </div>
  }
  observe() {
    debugger;
  }
}


ReactDOM.render(<Router history={browserHistory}>
    <Route path="/" component={App}></Route>
    <Route path="/:userId" component={User}></Route>
  </Router>, document.querySelector("#app"));