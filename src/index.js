import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import attachFastClick from 'fastclick';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import './style/index.css';
import './style/rotation.css';

class App extends Component {

  constructor(){
    super();

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
      status: ""
    }
  }

  componentWillMount() {
    this.socket = io('/blah');

    this.socket.on('new state', (state) => {
      console.log("received state");
      this.setState(state);
    })
  }

  componentDidMount(){
    this.socket.emit('request state');
  }

  componentWillUnMount() {
    this.socket.close();
  }

  handleSquareClick(squareNum){
    this.socket.emit('click', squareNum);
  }

  handleCollapse(choice){
    this.socket.emit('collapse click', choice);
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
              onChoiceClick={(choice) => this.handleCollapse(choice)}
             />

        </div>
      </div>
    );
  }
}

class Board extends Component {

  static propTypes = {
    cSquares: PropTypes.array.isRequired,
    qSquares: PropTypes.array,
    cycleSquares: PropTypes.array,
    cycleMarks: PropTypes.array,
    onSquareClick: PropTypes.func.isRequired,
    /**
      Passes index of square that was clicked up to Game.handleSquareClick.
    */

  }

  renderSquare(i) {
    return <Square
              cMark={this.props.cSquares[i]}
              qMarks={this.props.qSquares[i]}
              onClick={() => this.props.onSquareClick(i)}
              isHighlighted={Boolean(this.props.cycleSquares && this.props.cycleSquares.includes(i))}
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

  if (props.choices != null)
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

    if (props.cMark != null){

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
  if (props.qMarks != null){
    let marks = Array.from(props.qMarks.filter((x) => x != null));

    if (marks.length >= 1){
      spans = Array.from(marks.slice(0, -1).map((m) => {

      let markCls = classNames("white",
                               {"blue": props.isHighlighted && props.cycleMarks.includes(m)},
                               {"red": props.isBeingCollapsed && props.cycleMarks.includes(m)})

        return <span className={markCls} key={m}>{ m[0] }<sub>{ m[1] }</sub>, </span>;
      }));

      let lastMark = marks[marks.length - 1];
      let markCls = classNames("white",
                              {"blue": props.isHighlighted && props.cycleMarks.includes(lastMark)},
                              {"red": props.isBeingCollapsed && props.cycleMarks.includes(lastMark)})

      spans.push(<span className={markCls} key={lastMark}>{ lastMark[0] }<sub>{ lastMark[1] }</sub></span>);
    }
  }
  return <div> {spans} </div>;
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
attachFastClick.attach(document.body);
