import path from 'path';
import express from 'express';
import Game from './Game.js'

const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http);
const port = 4001;

app.use(express.static(path.join(__dirname, 'build')))

let games = {}

app.get('/', (req, res) => {

})

app.get('/:room', (req, res) => {
  console.log(req.params);
  let room = req.params.room;
  let nsp = io.of(`/${room}`);

  if (games[room] === undefined)
    games[room] = new Game()

  nsp.once('connection', (socket) => {
    console.log(`${socket.id} connected!`);
    let game = games[room]

    if (game.X === undefined)
      game.X = socket.id;
    else if (game.Y === undefined)
      game.Y = socket.id;
    else
      return;

    console.log(`Player X: ${games[room].X}`);
    console.log(`Player Y: ${games[room].Y}`);

    socket.on('click', (squareNum) => {
      let game = games[room];

      if (game.isTurn(socket.id)){
        game.handleSquareClick(squareNum);

        nsp.emit('new state', game.state);
      } else {
        console.log(`not ur turn, ${socket.id} its ${game.X}'s turn`);
      }
    });

    socket.on('collapse click', (choice) => {
      let game = games[room];

      if (game.isTurn(socket.id) &&
          game.state.cycleMarks.includes(choice)){

        game.handleCollapse(choice);
        nsp.emit('new state', game.state);
      }
    })
  });

  res.sendFile('index.html', {root: __dirname + '/build'});
});

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});
