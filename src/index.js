import React from 'react';
import ReactDOM from 'react-dom';
import attachFastClick from 'fastclick';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import generateName from 'sillyname';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import OnlineApp from './components/OnlineApp.js';
import OfflineApp from './components/OfflineApp.js';
import './style/app.css'
// ========================================

let name = generateName().split(' ')[0].toLowerCase();

const Home = () => {
  console.log("rendering home");

  return (
    <div className="container">
      <center>
        <h1> Quantum Tic Tac Toe </h1>
        <Link to={`/g/${name}`}> <RaisedButton label="Online" /> </Link>
        <Link to={"/offline"}> <RaisedButton label="Offline" /> </Link>
      </center>
    </div>
  );
}

const App = () => {
  return (
    <MuiThemeProvider>
      <Router>
        <div>
          <Route exact path="/" component={Home}/>

          <Route path="/g/:name" render={ ({match}) => {
              console.log(match)
              return <OnlineApp name={match.params.name} />
          }}/>
        <Route exact path="/offline" component={OfflineApp}/>
        </div>
      </Router>
    </MuiThemeProvider>
  );
}

ReactDOM.render(
  <App /> ,
  document.getElementById('root')
);

attachFastClick.attach(document.body);
