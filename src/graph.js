// undirected multigraph class

class Node{
  constructor(id){
    this.id = id;
    this.edges = [];
  }
}

class Edge{
  constructor(node1, node2, key){
    this.n1 = node1;
    this.n2 = node2;
    this.key = key;
  }
}

export default class Graph{

  constructor(){
      this.graph = {};
  }

  addNode(id){
    this.graph[id] = new Node(id);
  }

  getNode(id){
    return this.graph[id];
  }

  get nodes(){
    return Object.keys(this.graph)
  }

  addEdge(id1, id2, key){
    if (!(id1 in this.graph))
      this.addNode(id1);

    if (!(id2 in this.graph))
      this.addNode(id2);

    let edge = new Edge(this.getNode(id1), this.getNode(id2), key)

    this.getNode(id1).edges.push(edge)
    this.getNode(id2).edges.push(edge);
  }

  isEmpty(){
    return this.nodes.length === 0;
  }

  isCyclic(startId){
    if (this.isEmpty())
      return false;

    const start = this.getNode(startId);
    var q = [start];
    var layers = new Map(); // maps node to layer
    layers.set(start, 0);

    while( q ){
      let curr = q.shift();
      let layer = layers.get(curr);

      for (let child of curr.children){

        if (layers.has(child)) {
          if (layers.get(child) === layer - 1) // node we just came from
            continue;
          else if ( layers.get(child) >= layer)
            return true;
        } else {
          q.push(child);
          layers.set(child, layer + 1);
        }
      }

    }
  }

  getCycle(startId){
    if (this.isEmpty())
      return false;

    const start = this.getNode(startId);
    var q = [start];
    var layers = new Map(); // maps node to layer
    var prev = new Map(); // maps node to prev node
    layers.set(start, 0);

    while( q ){
      let curr = q.shift();
      let layer = layers.get(curr);

      for (let child of curr.children){

        if (layers.has(child)) {
          if (layers.get(child) === layer - 1)
            continue; // skip if node we just came from

          else if ( layers.get(child) >= layer)
            return this._constructPath(child, curr, prev)
        }

        q.push(child);
        layers.set(child, layer + 1);

      }
    }
  }

  _constructPath(node1, node2, prev){

  }
}

// eslint-disable-next-line
function test(){
  let g = new Graph()
  g.addNode('a')
  g.addNode('b')
  g.addNode('c')
  g.addEdge('a', 'b')
  g.addEdge('b', 'c')
  g.addEdge('c', 'a')
  console.log(g.isCyclic('a'))
}

test();
