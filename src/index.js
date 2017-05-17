import React from 'react';
import ReactDOM from 'react-dom';
import { List } from 'immutable';
import classNames from 'classnames';

import Graph from './graph.js';
import './index.css';
import './rotation.css';

var g = new Graph();

function Square (props){

    if (props.cValue)
      return (
        <button className="square" onClick={props.onClick}>
          { props.cValue }
        </button>
      );
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
    }
  }

  handleClick(i){


    if (this.state.cycle)
      this.handleCyclicEntanglement(i);

    else if (calculateWinner(this.state.cSquares))
      this.showMessage(calculateWinner(this.state.cSquares) + " already won :( Start a new game!!")

    else if (this.state.cSquares[i])
      this.showMessage("This square already has a classical mark! No more quantum marks can go here >:(")

    else if (this.state.subTurnNum % 2 // second move
        && this.state.lastMove === i)
      this.showMessage("Can't move twice in the same square! \n What do you think this is... regular tic tac toe??");

    else
      this.handleNormalMove(i);
  }

  handleNormalMove(i){
    const qSquares = this.state.qSquares;
    const cSquares = this.state.cSquares

    if (calculateWinner(cSquares) || cSquares[i])
      return

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

    let cycle = g.getCycle(i)
    if (cycle){
      console.log("cycle detected!");
      cycle = cycle.map((x) => x.id);
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
                 }));

  }

  handleCyclicEntanglement(i){

    if (! this.state.cycle.includes(i))
      return

    this.setState({collapseSquare: i});
  }

  handleCollapse(mark){
    console.log("you chose " + mark);
  }

  showMessage(msg){
    console.log(msg);
  }

  render() {

    const winner = calculateWinner(this.state.qSquares);
    let status;

    if (winner)
      status = winner + " wins!";
    else
      status = this.state.xIsNext ? 'Next player: X'  : 'Next player: Y';


    if (this.state.collapseSquare){
      var collapseChoices = this.state.qSquares[this.state.collapseSquare];

      var choices = collapseChoices.map((choice) => {
        return (
          <div className="collapseChoice"
             onClick={(choice) => this.handleCollapse(choice)}>
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

        </div>
        <div className="game-info">
          <div> {status} </div>
          <div> {choices} </div>
        </div>
      </div>
    );
  }
}

// ========================================

function calculateWinner(squares) {


  return null;
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
