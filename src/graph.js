// undirected multigraph class
import assert from "assert"

class Node{
  constructor(id){
    this.id = id;
    this.edges = [];
  }
}

class Edge{
  constructor(node1, node2, key){
    this.start = node1;
    this.end = node2;
    this.key = key;
  }
}

export default class Graph{

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

  isCyclic(startId){
    return Boolean(this.getCycle(startId));
  }

  getCycle(startId){

    // case one: graph too small for cycles
    if (this.numNodes() < 2)
      return null;

    // case two: cycle of len 2
    const start = this.getNode(startId);
    let visited = new Set();
    for (let edge of start.edges){
      if (visited.has(edge.end)){
        return [edge.start, edge.end];
      }

      visited.add(edge.end);
    }

    // case three: cycle of len > 2
    let q = [start];
    let layers = new Map(); // maps node to layer
    let prev = new Map(); // maps node to prev
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
            return this._constructPath(edge.start, edge.end, prev);
          }
        }

        q.push(edge.end);
        layers.set(edge.end, layer + 1);
        prev.set(edge.end, edge.start);
      }
    }

  }

  _constructPath(node1, node2, prev){
    let cycle = [];
    let curr = node1;

    while (curr){
      cycle.push(curr);
      curr = prev.get(curr);
    }

    curr = node2;

    while(prev.get(curr)){
      cycle.unshift(curr);
      curr = prev.get(curr);
    }

    return cycle;
  }
}

//////////////// UNIT TESTS ///////////////////

// eslint-disable-next-line
function testSimpleCyclic(){
  let g = new Graph();
  g.addNode('a');
  g.addNode('b');
  g.addNode('c');
  g.addEdge('a', 'b');
  g.addEdge('b', 'c');
  g.addEdge('c', 'a');
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

  g.addEdge('b', 'a', 'x1');
  g.addEdge('b', 'c', 'y1');
  g.addEdge('c', 'd', 'x2');
  g.addEdge('c', 'e', 'y2');
  g.addEdge('e', 'f', 'x3');
  g.addEdge('f', 'b', 'y3')
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
