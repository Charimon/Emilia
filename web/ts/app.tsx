import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Radium from 'radium';
import * as RetinaImage from 'react-retina-image';
import * as color from 'color';

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


class App extends React.Component<{}, {}> {
  render() {
    return <div style={{display:"flex", flexDirection:"column", height: "100%"}}>
      <Radium.Style rules= { globalStyle } />
      HERE
    </div>
  }
}

ReactDOM.render(<App />, document.querySelector("#app"));