import React from 'react';
import ReactDOM from 'react-dom';
import { List } from 'immutable';
import classNames from 'classnames';
//import io from 'socket.io';

import Graph from './graph.js';
import './index.css';
import './rotation.css';

var g = new Graph();

function Square (props){

    if (props.cValue){
      let cls = classNames('square', 'classical');

      return (
        <button className={cls} onClick={props.onClick}>
        <span className="dashing"><i></i></span>
        <span className="dashing"><i></i></span>
        <span className="dashing"><i></i></span>
        <span className="dashing"><i></i></span>
          { props.cValue }
        </button>
      );
    }
    else{

      let cls = classNames('square',
                          {'rotating-dashed': props.isHighlighted},
                          {'selected': props.isBeingCollapsed})
      return (
        <div className={cls} onClick={props.onClick}>
          <span className="dashing"><i></i></span>
          <span className="dashing"><i></i></span>
          <span className="dashing"><i></i></span>
          <span className="dashing"><i></i></span>
          <div className="marks">
            { props.qValues ?  props.qValues.join(', ') : null}
          </div>
        </div>
      );
    }
}

class Board extends React.Component {

  renderSquare(i) {
    return <Square
              cValue={this.props.cSquares[i]}
              qValues={this.props.qSquares[i]}
              onClick={() => this.props.onClick(i)}
              isHighlighted={this.props.cycle && this.props.cycle.includes(i)}
              isBeingCollapsed={this.props.collapseSquare === i}
           />;
  }

  render() {

    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

function StatusBar(props){
  return (<div className="game-info">
            <div className="status"> {props.status} </div>
            <div> {props.choices} </div>
          </div>);
}

class Game extends React.Component {
  constructor(){
    super();

    this.state = {
      cSquares: Array(9).fill(null), // classical squares
      qSquares: Array(9).fill(null), // quantum squares
      xIsNext: true,
      turnNum: 1,
      subTurnNum: 0,
      cycle: null,
      collapseSquare: null,
      gameOver: false,
      xScore: 0,
      yScore: 0,
    }
  }

  handleClick(i){

    if (this.state.cycle)
      this.handleCyclicEntanglement(i);

    else if (this.state.winner)
      this.setState({status: `${this.state.winner} already won :( Start a new game!!`});

    else if (this.state.cSquares[i])
      this.setState({status: "This square already has a classical mark! No more quantum marks can go here >:("});

    else if (this.state.subTurnNum % 2 // second move
        && this.state.lastMove === i)
      this.setState({status: "Can't move twice in the same square! \n What do you think this is... regular tic tac toe??"});

    else
      this.handleNormalMove(i);
  }

  handleNormalMove(i){
    let qSquares = this.state.qSquares;

    let marker;
    if (this.state.xIsNext)
      marker = 'X' + this.state.turnNum;
    else
      marker = 'Y' + this.state.turnNum;

    if (qSquares[i])
      qSquares[i] = qSquares[i].push(marker);
    else
      qSquares[i] = List([marker]);

    if (! g.hasNode(i))
      g.addNode(i);
    if (this.state.subTurnNum % 2) // second move
      g.addEdge(this.state.lastMove, i, marker);

    let cycle = g.getCycle(i);

    let status;
    if (cycle){
      console.log("cycle detected!");
      cycle = cycle.map((x) => x.id);

      let whoDecidesCollapse = this.state.xIsNext ? 'X' : 'Y' // opposite of who made cycle
      status = `A loop of entanglement has occured! Player ${whoDecidesCollapse} will decide which of the possible states the board will collapse into. Click one of the squares involved in the loop.`;
    } else {
      status = `Player ${this.state.xIsNext ? 'X' : 'Y'}'s turn!`
    }

    this.setState((state, props) => ({
                   qSquares: qSquares,
                   xIsNext: (state.subTurnNum === 3 || state.subTurnNum === 0)
                              ? true
                              : false,
                   turnNum: (state.subTurnNum + 1 === 4)
                              ? state.turnNum + 1
                              : state.turnNum,
                   subTurnNum: (state.subTurnNum + 1) % 4,
                   lastMove: i,
                   cycle: cycle,
                   status: status,
                 }));

  }

  handleCyclicEntanglement(i){

    if (! this.state.cycle.includes(i))
      return

    let whoDecidesCollapse = this.state.xIsNext ? 'X' : 'Y' // opposite of who made cycle
    let status = `Now, player ${whoDecidesCollapse}: choose below which state you want to occupy the selected square.`

    this.setState({
                  collapseSquare: i,
                  status: status,
                });
  }

  handleCollapse(mark, i){
    let visited = [mark];

    this._handleCollapseHelper(mark, i, visited)

    let scores = this.calculateScores();
    console.log(scores);

    let msg;
    if (scores){
      let winner = scores['X'] > scores['Y'] ? 'X' : 'Y';
      let loser = winner === 'X' ? 'Y' : 'X';

      if (scores['X'] + scores['Y'] === 1)
        msg = `${winner} wins!!! \n ${winner} gets 1 point \n ${loser} gets 0 points`;

      else if (scores['X'] === 1.5 || scores['Y'] === 1.5)
        msg = `${winner} wins with a double three-in-a-row!!! \n ${winner} gets 1.5 points \n ${loser} gets 0 points`;

      else if (scores['X'] + scores['Y'] === 1.5)
        msg = `Both players got three in a row, but ${winner} got it first! (The mark placed in${winner}'s three-in-a-row has a smaller subscript than ${loser} \n ${winner} gets 1 point \n ${loser} gets 0.5 points`;

      this.setState({
        gameOver: Boolean(scores),
        xScore: this.state.xScore + scores['X'],
        yScore: this.state.yScore + scores['Y'],
      })
    } else {
      msg = `Player ${this.state.xIsNext ? 'X' : 'Y'}'s turn!`;
    }

    this.setState({
      cycle: null,
      collapseSquare: null,
      status: msg,
    });

  }

  _handleCollapseHelper(mark, i, visited){
    let cSquares = this.state.cSquares;
    let qSquares = this.state.qSquares;
    cSquares[i] = mark;
    qSquares[i] = null;

    this.setState( {
      cSquares: cSquares,
      qSquares: qSquares
    });

    console.log("here");
    console.log(visited);

    for (let edge of g.getNode(i).edges){
      if (! visited.includes(edge.key)){
        visited.push(edge.key);
        this._handleCollapseHelper(edge.key, edge.end.id, visited);
      }
    }
  }

  showMessage(msg){
    console.log(msg);
  }

  calculateWinners(){
    const squares = this.state.cSquares;
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    let winners = [];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[b] && squares[c] &&
          squares[a][0] === squares[b][0] &&
          squares[a][0] === squares[c][0]) {

        let subscripts = [squares[a][1], squares[b][1], squares[c][1]].map(Number);

        winners.push( [
                        Math.max(...subscripts),
                        squares[a][0],
                        lines[i],
                      ]
                    ) ;
      }
    }

    return winners;
  }

  calculateScores() {
    let winners = this.calculateWinners();

    if (winners.length === 0)
      return null

    winners.sort();
    let scores = {'X': 0, 'Y': 0}

    if (winners.length >= 1)
      scores[ winners[0][1] ] += 1;
    else if (winners.length >= 2)
      scores[ winners[1][1] ] += 0.5;
    else if (winners.length === 3)
      scores[ winners[2][1] ] += 0.5;

    return scores;
  }

  render() {

    let i = this.state.collapseSquare

    if (i !== null){
      var collapseChoices = this.state.qSquares[i];

      var choices = collapseChoices.map((choice) => {
        let handleCollapse_ = this.handleCollapse.bind(this, choice, i, null);

        return (
          <div className="collapseChoice"
             onClick={(choice) => handleCollapse_(choice, i, null)}
             key={choice}>
             {choice}
          </div>
        );
      });
    }

    return (
      <div className="game">
        <div className="game-board">

            <Board
              cSquares={this.state.cSquares}
              qSquares={this.state.qSquares}
              cycle={this.state.cycle}
              collapseSquare={this.state.collapseSquare}
              onClick={(i) => this.handleClick(i)}
            />

            <div className="xScore"> X: {this.state.xScore} </div>
            <div className="yScore"> Y: {this.state.yScore} </div>
        </div>
          <StatusBar
            status={this.state.status}
            choices={choices}
           />
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
