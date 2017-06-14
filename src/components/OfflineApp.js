import React, { Component } from 'react';
import assert from 'assert';
import Board from './Board.js';
import SideBar from './SideBar.js';
import '../style/app.css';


export default class OfflineApp extends React.Component {
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

    if (! this.state.cycleSquares.includes(i))
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

export function getWinnerMsg(scores){
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

export function calculateWinners(squares){
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

export function calculateScores(squares) {
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

/**
 An undirected multigraph class
*/

class Node{
  constructor(id){
    this.id = id;
    this.edges = [];
  }
}

/** Need both Node and Edge for mulitgraph, as each node can have multiple
    edges between them, whose uniqueness needs to be accounted for.
*/
class Edge{
  constructor(node1, node2, key){
    this.start = node1;
    this.end = node2;
    this.key = key;
  }
}

class Graph{

  constructor(){
      this.nodes = {};
      this.edges = {};
  }

  addNode(id){
    this.nodes[id] = new Node(id);
  }

  getNode(id){
    return this.nodes[id];
  }

  hasNode(id){
    return id in this.nodes;
  }

  addEdge(id1, id2, key){
    if (! (id1 in this.nodes))
      this.addNode(id1);

    if (! (id2 in this.nodes))
      this.addNode(id2);

    let edge = new Edge(this.getNode(id1), this.getNode(id2), key);
    let reverseEdge = new Edge(this.getNode(id2), this.getNode(id1), key);

    this.getNode(id1).edges.push(edge);
    this.getNode(id2).edges.push(reverseEdge);
    this.edges[key] = edge;
  }

  numNodes(){
    return Object.keys(this.nodes).length;
  }

  /**
    @param {Object} startId - id of one of the nodes involved in the cycle
    @return {Boolean}
  */
  isCyclic(startId){
    // TODO: optimize
    return Boolean(this.getCycle(startId));
  }

  /**
    @param {Object} startId - id of one of the nodes involved in the cycle
    @return {List} List of Nodes and Edges involved in cycle
  */
  getCycle(startId){

    // case one: graph too small for cycles
    if (this.numNodes() < 2)
      return null;

    // case two: cycle of len 2
    const start = this.getNode(startId);
    let visited = new Set();
    let endToEdge = new Map();

    for (let edge of start.edges){
      if (visited.has(edge.end)){
        return [ [edge.start.id, edge.end.id],
                 [edge.key, endToEdge.get(edge.end).key]
               ];
      }

      visited.add(edge.end);
      endToEdge.set(edge.end, edge);
    }

    // case three: cycle of len > 2
    let q = [start];
    let layers = new Map(); // maps node to layer
    let prev = new Map(); // maps node to its associated edge
    layers.set(start, 0);
    prev.set(start, null);

    while( q !== undefined && q.length > 0 ){

      let curr = q.shift();
      let layer = layers.get(curr);

      for (let edge of curr.edges){

        if (layers.has(edge.end)) {
          if (layers.get(edge.end) === layer - 1) // node we just came from
            continue;
          else{
            return this._constructPath(edge, prev);
          }
        }

        q.push(edge.end);
        layers.set(edge.end, layer + 1);
        prev.set(edge.end, edge);
      }
    }

  }

  _constructPath(edge, prev){
    let cycleNodeIds = [];
    let cycleEdgeKeys = [edge.key];
    let currNode, currEdge;

    // go around one way
    currNode = edge.start;
    while (prev.get(currNode)){
      currEdge = prev.get(currNode);
      cycleNodeIds.push(currNode.id);
      cycleEdgeKeys.push(currEdge.key);
      currNode = currEdge.start;
    }
    cycleNodeIds.push(currNode.id) /// get start node only once

    // go around the other way
    currNode = edge.end;
    while(prev.get(currNode)){
      currEdge = prev.get(currNode);
      cycleNodeIds.unshift(currNode.id);
      cycleEdgeKeys.unshift(currEdge.key);
      currNode = currEdge.start;
    }

    return [cycleNodeIds, cycleEdgeKeys];
  }
}

//////////////// UNIT TESTS ///////////////////

// eslint-disable-next-line
function testSimpleCyclic(){
  let g = new Graph();
  g.addNode('a');
  g.addNode('b');
  g.addNode('c');
  g.addEdge('a', 'b', 'ab');
  g.addEdge('b', 'c', 'bc');
  g.addEdge('c', 'a', 'ca');
  assert(g.isCyclic('a'));
  console.log(g.getCycle('a'));
}

// eslint-disable-next-line
function testPair(){
  let g = new Graph();
  g.addNode('a');
  g.addNode('b');
  g.addEdge('a', 'b', 'x1');
  g.addEdge('a', 'b', 'y1');
  assert(g.isCyclic('a'));
  console.log(g.getCycle('a'));
}

// eslint-disable-next-line
function testReversePair(){
  let g = new Graph();
  g.addNode('a');
  g.addNode('b');
  g.addEdge('a', 'b', 'x1');
  g.addEdge('b', 'a', 'x2');
  assert(g.isCyclic('a'));
  console.log(g.getCycle('a'));
}

// eslint-disable-next-line
function testMessyCyclic(){
  let g = new Graph()
  g.addNode('a');
  g.addNode('b');
  g.addNode('c');
  g.addNode('d');
  g.addNode('e');
  g.addNode('f');

  g.addEdge('b', 'a', 'ba');
  g.addEdge('b', 'c', 'bc');
  g.addEdge('c', 'd', 'cd');
  g.addEdge('c', 'e', 'ce');
  g.addEdge('e', 'f', 'ef');
  g.addEdge('f', 'b', 'fb');
  assert(g.isCyclic('b'));
  console.log(g.getCycle('b'));
}

// eslint-disable-next-line
function testSimpleAcyclic(){
  let g = new Graph()
  g.addNode('a');
  g.addNode('b');

  g.addEdge('a', 'b', 'x1');
  assert(! g.isCyclic('b'));
  console.log(g.getCycle('b'));
}

// eslint-disable-next-line
function testPairAcyclic(){
  let g = new Graph()
  g.addNode('a');
  g.addNode('b');

  g.addEdge('a', 'b', 'x1');
  assert(! g.isCyclic('b'));
  console.log(g.getCycle('b'));
}

// eslint-disable-next-line
function testMessyAcyclic(){
  let g = new Graph()
  g.addNode('a');
  g.addNode('b');
  g.addNode('c');
  g.addNode('d');
  g.addNode('e');
  g.addNode('f');

  g.addEdge('b', 'a', 'x1');
  g.addEdge('b', 'c', 'y1');
  g.addEdge('c', 'd', 'x2');
  g.addEdge('c', 'e', 'y2');
  g.addEdge('e', 'f', 'x3');
  assert(! g.isCyclic('b'));
  console.log(g.getCycle('b'));
}

// eslint-disable-next-line
function runTests(){
  testSimpleCyclic();
  testPair();
  testReversePair();
  testMessyCyclic();

  testSimpleAcyclic();
  testPairAcyclic();
  testMessyAcyclic();
}

//runTests();
