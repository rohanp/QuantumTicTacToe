import Graph from './Graph.js';
import {getWinnerMsg, calculateScores} from './helpers.js';

export default class Game {

  constructor(room) {
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

  setState(obj){
    Object.assign(this.state, obj);
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
    let marker = this.whoseTurn(this.state.subTurnNum) + this.state.turnNum;

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

    this.setState({
                    qSquares,
                    cycleSquares,
                    cycleMarks,
                    status,
                    turnNum: (this.state.subTurnNum + 1 === 4)
                                ? this.state.turnNum + 1
                                : this.state.turnNum,
                    subTurnNum: (this.state.subTurnNum + 1) % 4,
                    lastMove: i,
                 });

  }

  // selects square to be collapse point
  handleCyclicEntanglement(i){

    if (! this.state.cycleSquares.includes(i))
      return

    // opposite of who made cycle
    let whoDecidesCollapse = this.whoseTurn() === 'X' ? 'Y' : 'X'
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

  // utility functions
  isTurn(id){
    if (this.whoseTurn() === 'X')
      return this.X === id;
    else
      return this.Y === id;
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

}
