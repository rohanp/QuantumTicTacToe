import React from 'react';
import ReactDOM from 'react-dom';
import { List } from 'immutable';
import Graph from './graph.js';
import './index.css';

var g = new Graph();

function Square (props){

    if (props.cValue)
      return (
        <button className="square" onClick={props.onClick}>
          { props.cValue }
        </button>
      );
    else{

      return (
        <button className="square" onClick={props.onClick}>
          { props.qValues ?  props.qValues.join(', ') : null}
        </button>
      );
    }
}

class Board extends React.Component {

  renderSquare(i) {
    return <Square
              cValue={this.props.cSquares[i]}
              qValues={this.props.qSquares[i]}
              onClick={() => this.props.onClick(i)}
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
      history: [],
      xIsNext: true,
      turnNum: 0,
      secondMove: false,
    }
  }

  handleClick(i){

    const qSquares = this.state.qSquares;
    const cSquares = this.state.cSquares

    if (! g.isCyclic()){
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

      g.addNode(i);

      if (this.state.secondMove)
        g.addEdge(this.state.lastMove, i);

      let cycle = g.getCycle(i)

      if (cycle){
        this.highlightCycle(cycle);
      }

      this.setState((state, props) => ({
                     qSquares: qSquares,
                     xIsNext: state.secondMove ? ! state.xIsNext : state.xIsNext,
                     turnNum: state.secondMove ? state.turnNum + 1 : state.turnNum,
                     secondMove: ! state.secondMove,
                     lastMove: i,
                   }));
      } else {
        console.log("cycle detected!")
        let cycle = g.getCycle();

        if (! cycle.includes(i))
          return


      }

      console.log(g)
  }

  highlightCycle(cycle){




  }

  render() {

    const winner = calculateWinner(this.state.qSquares);
    let status;

    if (winner)
      status = winner + " wins!";
    else
      status = this.state.xIsNext ? 'Next player: X'  : 'Next player: Y';

    return (
      <div className="game">
        <div className="game-board">

            <Board
              cSquares={this.state.cSquares}
              qSquares={this.state.qSquares}
              onClick={(i) => this.handleClick(i)}
            />

        </div>
        <div className="game-info">
          <div> {status} </div>
          <div onClick={() => this.undo()}> Undo </div>
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
