import React from 'react';
import ReactDOM from 'react-dom';
import attachFastClick from 'fastclick';
import generateName from 'sillyname';
import ReactDipper from 'react-dipper';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import OnlineApp from './components/OnlineApp.js';
import OfflineApp from './components/OfflineApp.js';
import './style/app.css';
// ========================================

let name = generateName().split(' ')[0].toLowerCase();

const Home = () => {

  return (
    <div className="border">
      <center>
        <h1 className=""> Quantum Tic Tac Toe </h1>
        <Link to={`/g/${name}`}>
          <div className="button"> online </div>
        </Link>
        <Link to={"/offline"}>
          <div className="button"> offline </div>
        </Link>
      </center>
    </div>
  );
}

const App = () => {
  return (
    <div id="container">
      <ReactDipper styleParams={{backgroundColor: "none !important"}} />

      <div className="overlay">
        <div className="withinOverlay">
          <Router>
            <div>
              <Route exact path="/" component={Home}/>

              <Route path="/g/:name" render={ ({match}) => {
                  return <div className="board"> <OnlineApp name={match.params.name} /> </div>
              }}/>
            <Route exact path="/offline" render={ () => {
                  return <div className="board"> <OfflineApp /> </div>
              }}/>
            </div>
          </Router>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(
  <App /> ,
  document.getElementById('root')
);

attachFastClick.attach(document.body);
