import React, { Component } from 'react';
import assert from 'assert';
import Board from './Board.js';
import SideBar from './SideBar.js';
import Game from '../Game.js';
import '../style/app.css';


export default class OfflineApp extends React.Component {
  constructor(){
    super();
    this.game = new Game();
    this.state = this.game.state;
  }

  whoseTurn(){
    return (this.state.subTurnNum < 2) ? 'X' : 'Y';
  }

  isSecondMove(){
    return this.state.subTurnNum === 1 || this.state.subTurnNum === 3;
  }

  setStatus(msg){
    this.setState({status: msg});
  }

  // dispatches click to appropriate handler based on state
  handleSquareClick(i){
    let statuses = this.game.handleSquareClick(i);
    let status = statuses[ this.whoseTurn() ];

    this.setState(this.game.state);
    this.setState({status});
  }

  handleCyclicEntanglement(i){
    let statuses = this.game.handleCyclicEntanglement(i);
    let status = statuses[ this.whoseTurn() ];

    this.setState(this.game.state);
    this.setState({status});
  }

  handleCollapse(mark){
    let statuses = this.game.handleCollapse(mark);
    let status = statuses[ this.whoseTurn() ];

    this.setState(this.game.state);
    this.setState({status});
  }

  whoseTurn(){
    return (this.state.subTurnNum < 2) ? 'X' : 'Y';
  }

  isSecondMove(){
    return this.state.subTurnNum === 1 || this.state.subTurnNum === 3;
  }
  render() {
    let choices;
    console.log(this.state);

    if(this.state.collapseSquare != null)
      choices = this.state.qSquares[ this.state.collapseSquare ]
        .filter((choice) => this.state.cycleMarks.includes(choice) )

    return (
      <div>
        <center> <h1> Quantum Tic Tac Toe </h1> </center>
        <div className="game">
          <div className="game-board">

              <Board
                cSquares={this.state.cSquares}
                qSquares={this.state.qSquares}
                cycleSquares={this.state.cycleSquares}
                cycleMarks={this.state.cycleMarks}
                collapseSquare={this.state.collapseSquare}
                onSquareClick={(i) => this.handleSquareClick(i)}
              />

              <div className="xScore"> X: {this.state.xScore} </div>
              <div className="yScore"> Y: {this.state.yScore} </div>
          </div>

            <SideBar
              status={this.state.status}
              choices={choices}
              onChoiceClick={(choice) => this.handleCollapse(choice)}
             />

        </div>
      </div>
    );
  }
}
