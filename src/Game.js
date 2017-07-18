const Graph = require('./Graph.js');

class Game {

  constructor(controller) {
    this.g = new Graph();
    this.timer = this.timer.bind(this);
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
      xTimeLeft: 60 * 5,  // in seconds
      yTimeLeft: 60 * 5,
      xScore: 0,
      yScore: 0,
    }
  }

  whoseTurn() {
    return (this.state.subTurnNum < 2) ? 'X' : 'Y';
  }

  timer() {
    if (this.whoseTurn() === 'X'){
      if (this.state.xTimeLeft <= 0){
        console.log("here!!")
        this.setState({
          gameOver: true,
          status: "Player X has run out of time. Player Y wins!"
        })
      } else
        this.setState({xTimeLeft: this.state.xTimeLeft - 1})
    }
    else if (this.whoseTurn() === 'Y'){
      if (this.state.yTimeLeft <= 0){
        this.setState({
          gameOver: true,
          status: "Player Y has run out of time. Player X wins!"
        })
      } else
        this.setState({yTimeLeft: this.state.yTimeLeft - 1})
    }
  }

  setState(obj){
    Object.assign(this.state, obj);
  }

  // dispatches click to appropriate handler based on state
  handleSquareClick(i){

    if (this.state.turnNum === 1 && this.state.subTurnNum === 0) // initialize timer at game start
      setInterval(this.timer, 1000);

    if (this.state.gameOver)
      return {
                'X': "This game is already over! Start a new game!!",
                'Y': "This game is already over! Start a new game!!"
             };

    else if (this.state.cycleSquares)
      return this.handleCyclicEntanglement(i);

    else if (this.state.cSquares[i])
      return {
                [this.whoseTurn()]: "This square already has a classical mark! No more quantum marks can go here >:("
             };

    else if (this.isSecondMove() && this.state.lastMove === i)
      return {
                [this.whoseTurn()]: "Can't move twice in the same square! \n What do you think this is... regular tic tac toe??"
            };

    else
      return this.handleNormalMove(i);

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

    let cycleSquares, cycleMarks, whoDecidesCollapse, status;

    if (this.g.isCyclic(i)){
      [cycleSquares, cycleMarks] = this.g.getCycle(i);

      whoDecidesCollapse = this.notWhoseTurn() // opposite of who made cycle
      status = `A loop of entanglement has occured! Player ${whoDecidesCollapse} will decide which of the possible states the board will collapse into.`;
    }

    this.setState({
                    qSquares,
                    cycleSquares,
                    cycleMarks,
                    turnNum: (this.state.subTurnNum + 1 === 4)
                                ? this.state.turnNum + 1
                                : this.state.turnNum,
                    subTurnNum: (this.state.subTurnNum + 1) % 4,
                    lastMove: i,
                 });

    if (whoDecidesCollapse !== undefined)
      return {
                [whoDecidesCollapse]: status + "Click one of the squares involved in the loop.",
                [this.opposite(whoDecidesCollapse)]: status,
             };
    else if (this.isSecondMove())
      return {
                [this.whoseTurn()]: "Now put a second quantum move. This move is entangled with your previous move. When there is a cycle of entanglement, a collapse will occur and only one of these quantum marks will turn into a classical mark.",
                [this.notWhoseTurn()]: `Player ${this.whoseTurn()}'s move.`
             };
    else
      return {
                [this.whoseTurn()]: "Your turn! Put down a quantum move (these are the small marks).",
                [this.notWhoseTurn()]: `Now it's ${this.whoseTurn()}'s turn.`
            };
  }

  // selects square to be collapse point
  handleCyclicEntanglement(i){

    if (! this.state.cycleSquares.includes(i))
      return {
                [this.whoseTurn()]: "Must pick square involved in cyclic entanglement! (is highlighted in blue)"
             }

    this.setState({
                  collapseSquare: i,
                });
    return {[this.whoseTurn()]: "Now, choose below which state you want to occupy the selected square."}

  }

  // collapes square and propogates changes outward
  handleCollapse(mark){
    console.log(mark);
    let i = this.state.collapseSquare;
    let visited = new Set([mark]);

    this._handleCollapseHelper(mark, i, visited)

    let scores = calculateScores(this.state.cSquares);

    let status;
    if (scores){ // if someone won
      status = {
                'X': getWinnerMsg(scores),
                'Y': getWinnerMsg(scores)
              };

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
      status = {
                  'X': `${this.whoseTurn()} next!`,
                  'Y': `${this.whoseTurn()} next!`
              };

      this.setState({
        cycleSquares: null,
        cycleMarks: null,
        collapseSquare: null,
      });
    }

    return status;
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

  opposite(p){
    return p === 'X' ? 'Y' : 'X';
  }

  notWhoseTurn(){
    return (this.state.subTurnNum < 2) ? 'Y' : 'X';
  }

  handleNotYourTurn(){
    return [this[this.notWhoseTurn()], "It's not your turn!"];
  }

  getPlayer(socketID){
    if (this.X === socketID)
      return 'X';
    if (this.Y === socketID)
      return 'Y';
  }

  // utility functions
  isTurn(id){
    if (this.whoseTurn() === 'X')
      return this.X === id;
    else
      return this.Y === id;
  }

  isSecondMove(){
    return this.state.subTurnNum === 1 || this.state.subTurnNum === 3;
  }

  setStatus(msg){
    this.setState({status: msg});
  }

}

// pure functions to help with game logic in index.js
function getWinnerMsg(scores){
  let msg;
  let winner = scores['X'] > scores['Y'] ? 'X' : 'Y';
  let loser = winner === 'X' ? 'Y' : 'X';

  if (scores['X'] + scores['Y'] === 1)
    msg = `${winner} wins!!! \n ${winner} gets 1 point \n ${loser} gets 0 points`;

  else if (scores['X'] === 1.5 || scores['Y'] === 1.5)
    msg = `${winner} wins with a double three-in-a-row!!! \n ${winner} gets 1.5 points \n ${loser} gets 0 points`;

  else if (scores['X'] + scores['Y'] === 1.5)
    msg = `Both players got three in a row, but ${winner} got it first! (The mark placed in${winner}'s three-in-a-row has a smaller subscript than ${loser} \n ${winner} gets 1 point \n ${loser} gets 0.5 points`;

  return msg;
}

function calculateWinners(squares){
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

function calculateScores(squares) {
  let winners = calculateWinners(squares);

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

module.exports = Game;
