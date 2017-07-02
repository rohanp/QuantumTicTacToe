import React, { Component } from 'react';
import io from 'socket.io-client';

import Board from './Board.js';
import SideBar from './SideBar.js'
import '../style/app.css';

export default class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      cSquares: Array(9).fill(null),
      /**
        `i`th element contains classical mark for `i`th square, `null` if it has none
        (3x3 grid of squares is represented as 1D array of length 9).
      */
      qSquares: Array(9).fill(null),
      /**
        `i`th element contains list of quantum marks contained in square `i`th square,
        `null` if it has none.
      */
      turnNum: 1,
      subTurnNum: 0,
      /**
        has value 0-3 to represent all states within a turn
        (X move 1, X move 2, Y move 1, Y move 2)
      */
      cycleSquares: null,
      /**
        Contains indexes (Int) of squares involved in a cycle, `null` if no cycle exists.
      */
      cycleMarks: null,
      /**
        Contains marks (String) involved in a cycle, `null` if no cycle exists.
      */
      collapseSquare: null,
      /**
        Square selected to be origin of collapse, if there is a cycle.
      */
      gameOver: false,
      xScore: 0,
      yScore: 0,
      status: `You have joined game ${props.name}! Send your url to your friend so they can join.`,
    }
  }

  componentWillMount() {
    console.log(`connecting to ${this.props.name}`);
    fetch(`/g/${this.props.name}`, {
      method: 'POST',
    });

    this.socket = io(`/g/${this.props.name}`);

    this.socket.on('new state', (state) => {
      console.log("received state");
      this.setState(state);
    })

    this.socket.on('new status', (status) => {
      console.log("received status");
      this.setState({status});
    });
  }

  componentDidMount(){
    console.log("requesting status")
    this.socket.emit('request status');
  }

  componentWillUnMount() {
    this.socket.close();
  }

  handleSquareClick(squareNum){
    this.socket.emit('click', squareNum);
  }

  handleCollapse(mark){
    this.socket.emit('collapse click', mark);
  }

  whoseTurn(){
    return (this.state.subTurnNum < 2) ? 'X' : 'Y';
  }

  render() {
    let status, choices;

    if (this.state.status != null)
      status = this.state.status;
    else
      status = `Player ${this.whoseTurn()} is next!`;

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
              status={status}
              choices={choices}
              onChoiceClick={(mark) => this.handleCollapse(mark)}
             />

        </div>
      </div>
    );
  }
}
