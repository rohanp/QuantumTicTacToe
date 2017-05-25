import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import attachFastClick from 'fastclick';
import PropTypes from 'prop-types';

import Graph from './graph.js';
import {getWinnerMsg, calculateScores} from './helpers.js'

import './style/index.css';
import './style/rotation.css';

class Game extends React.Component {
  constructor(){
    super();

    this.g = new Graph();

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
        Array of indexes of Squares involved in a cycle, `null` if none exists.
      */
      cycleMarks: null,
      /**
        Array of marks (eg. 'X1', 'Y3') involved in a cycle, `null` if none exists.
      */
      collapseSquare: null,
      /**
        Square selected to be origin of collapse, if there is a cycle.
      */
      gameOver: false,
      xScore: 0,
      yScore: 0,
    }
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

    if (this.state.cycleSquares)
      this.handleCyclicEntanglement(i);

    else if (this.state.gameOver)
      this.setStatus("This game is already over! Start a new game!!");

    else if (this.state.cSquares[i])
      this.setStatus("This square already has a classical mark! No more quantum marks can go here >:(");

    else if (this.state.subTurnNum % 2 // second move
        && this.state.lastMove === i)
      this.setStatus("Can't move twice in the same square! \n What do you think this is... regular tic tac toe??");

    else
      this.handleNormalMove(i);
  }

  // adds quantum mark to square that was clicked on then checks if that created a cycle
  handleNormalMove(i){
    let qSquares = this.state.qSquares;
    let marker = this.whoseTurn() + this.state.turnNum;

    if (qSquares[i])
      qSquares[i].push(marker);
    else
      qSquares[i] = [marker];

    if (! this.g.hasNode(i))
      this.g.addNode(i);
    if (this.isSecondMove())
      this.g.addEdge(this.state.lastMove, i, marker);

    let cycleSquares, cycleMarks, status;

    if (this.g.isCyclic(i)){
      [cycleSquares, cycleMarks] = this.g.getCycle(i);

      let whoDecidesCollapse = this.whoseTurn() === 'X' ? 'Y' : 'X' // opposite of who made cycle
      status = `A loop of entanglement has occured! Player ${whoDecidesCollapse} will decide which of the possible states the board will collapse into. Click one of the squares involved in the loop.`;
    }

    this.setState((state, props) => ({
                    qSquares,
                    cycleSquares,
                    cycleMarks,
                    status,
                    turnNum: (state.subTurnNum + 1 === 4)
                                ? state.turnNum + 1
                                : state.turnNum,
                    subTurnNum: (state.subTurnNum + 1) % 4,
                    lastMove: i,
                 }));

  }

  // selects square to be collapse point
  handleCyclicEntanglement(i){

    if (! this.state.cycleSquares.has(i))
      return

    let whoDecidesCollapse = this.whoseTurn() === 'X' ? 'Y' : 'X' // opposite of who made cycle
    let status = `Now, player ${whoDecidesCollapse}: choose below which state you want to occupy the selected square.`

    this.setState({
                  status,
                  collapseSquare: i,
                });
  }

  // collapes square and propogates changes outward
  handleCollapse(mark){
    console.log(mark);
    let i = this.state.collapseSquare;
    let visited = new Set([mark]);

    this._handleCollapseHelper(mark, i, visited)

    let scores = calculateScores(this.state.cSquares);

    if (scores){ // if someone won
      let status = getWinnerMsg(scores);

      this.setState({
        status,
        gameOver: true,
        xScore: this.state.xScore + scores['X'],
        yScore: this.state.yScore + scores['Y'],
        cycleSquares: null,
        cycleMarks: null,
        collapseSquare: null,
      })
    } else {

      this.setState({
        cycleSquares: null,
        cycleMarks: null,
        collapseSquare: null,
      });
    }

  }

  _handleCollapseHelper(mark, i, visited){
    let cSquares = this.state.cSquares;
    let qSquares = this.state.qSquares;
    cSquares[i] = mark;
    qSquares[i] = null;

    this.setState( {
      cSquares,
      qSquares,
    });

    for (let edge of this.g.getNode(i).edges){
      if (! visited.has(edge.key)){
        visited.add(edge.key);
        this._handleCollapseHelper(edge.key, edge.end.id, visited);
      }
    }
  }

  render() {
    let status, choices;

    if (this.state.status)
      status = this.state.status;
    else
      status = `Player ${this.whoseTurn()} is next!`;

    if(this.state.collapseSquare)
      choices = this.state.qSquares[ this.state.collapseSquare ]
        .filter((choice) => this.state.cycleMarks.has(choice) )

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
              onChoiceClick={(choice) => this.handleCollapse(choice)}
             />

        </div>
      </div>
    );
  }
}

class Board extends React.Component {

  static propTypes = {
    cSquares: PropTypes.array.isRequired,
    /**
      `i`th element contains classical mark for `i`th square, `null` if it has none
      (3x3 grid of squares is represented as 1D array of length 9).
    */
    qSquares: PropTypes.array,
    /**
      `i`th element contains list of quantum marks contained in square `i`th square,
      `null` if it has none.
    */
    onSquareClick: PropTypes.func.isRequired,
    /**
      Passes index of square that was clicked up to Game.handleSquareClick.
    */
    cycleSquares: PropTypes.instanceOf(Set),
    /**
      Contains indexes (Int) of squares involved in a cycle, `null` if no cycle exists.
    */
    cycleMarks: PropTypes.instanceOf(Set),
    /**
      Contains marks (String) involved in a cycle, `null` if no cycle exists.
    */
  }

  renderSquare(i) {
    return <Square
              cMark={this.props.cSquares[i]}
              qMarks={this.props.qSquares[i]}
              onClick={() => this.props.onSquareClick(i)}
              isHighlighted={Boolean(this.props.cycleSquares && this.props.cycleSquares.has(i))}
              isBeingCollapsed={this.props.collapseSquare === i}
              cycleMarks={this.props.cycleMarks}
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

SideBar.propTypes = {
  choices: PropTypes.array,
  /**
    Contains marks in selected square if collapse ongoing, else is `null`
  */
  onChoiceClick: PropTypes.func.isRequired,
  /**
    Passes selected choice of mark up to Game.handleCollapse
  */
  status: PropTypes.string.isRequired,
  /**
    Conveys player information about the state of the game
  */
}

function SideBar(props){
  let choices;

  if (props.choices)
    choices = props.choices.map((choice) => {
        return (
          <div className="collapseChoice"
             onClick={() => props.onChoiceClick(choice)}
             key={choice}>
             {choice}
          </div>
        );
      });

  return (<div className="game-info">
            <div className="status"> {props.status} </div>
            {choices}
          </div>);
}

Square.propTypes = {
  cMark: PropTypes.string,
  /**
    Classical mark to be displayed in Square, or `null` if there is none.
  */
  onClick: PropTypes.func.isRequired,
  /**
    Passes index of Square clicked up to Game.handleClick.
  */
  isHighlighted: PropTypes.bool.isRequired,
  /**
    True if square is involved in a cycle or not. If so, a rotating border
    will be added to the square for emphasis.
  */
  isBeingCollapsed: PropTypes.bool.isRequired,
  /**
    True if there is a cycle and square is selected as collapse node.
  */
  qMarks: PropTypes.array,
  /**
    Contains quantum marks to display inside of Square. Ignored if `cMark` is non-null.
  */
  cycleMarks: PropTypes.array,
  /**
    Contains marks involved in cycle, `null` if no cycle currently exists. Used to
    colorize only marks involved in cycle, as they are the only valid targets for
    collapse.
  */
}

function Square (props){

    let dashHelper = (
      <div>
        <span className="dashing"><i></i></span>
        <span className="dashing"><i></i></span>
        <span className="dashing"><i></i></span>
        <span className="dashing"><i></i></span>
      </div>
    );

    if (props.cMark){

      return (
        <div className={'square classical'} onClick={props.onClick}>
          {dashHelper}
          <div className="marks adjustCenter">
            { props.cMark[0] }<sub>{ props.cMark[1] }</sub>
          </div>
        </div>
      );
    } else{

      let cls = classNames('square',
                          {'rotating-dashed': props.isHighlighted},
                          {'selected': props.isBeingCollapsed})

      return (
        <div className={cls} onClick={props.onClick}>
          {dashHelper}
          <div className="marks">
            <QuantumMarks
              isHighlighted={props.isHighlighted}
              isBeingCollapsed={props.isBeingCollapsed}
              qMarks={props.qMarks}
              cycleMarks={props.cycleMarks}
            />
          </div>
        </div>
      );
    }
}

function QuantumMarks (props){

  let spans;
  if (props.qMarks){
    let marks = Array.from(props.qMarks.filter((x) => x != null));

    if (marks.length >= 1){
      spans = Array.from(marks.slice(0, -1).map((m) => {

      let markCls = classNames("white",
                               {"blue": props.isHighlighted && props.cycleMarks.has(m)},
                               {"red": props.isBeingCollapsed && props.cycleMarks.has(m)})

        return <span className={markCls} key={m}>{ m[0] }<sub>{ m[1] }</sub>, </span>;
      }));

      let lastMark = marks[marks.length - 1];
      let markCls = classNames("white",
                              {"blue": props.isHighlighted && props.cycleMarks.has(lastMark)},
                              {"red": props.isBeingCollapsed && props.cycleMarks.has(lastMark)})

      spans.push(<span className={markCls} key={lastMark}>{ lastMark[0] }<sub>{ lastMark[1] }</sub></span>);
    }
  }
  return <div> {spans} </div>;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
attachFastClick(document.body);
