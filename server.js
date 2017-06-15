import path from 'path';
import express from 'express';
import Game from './src/Game.js';
import Moniker from 'moniker';

const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http);
const port = 4001;

app.use(express.static(path.join(__dirname, 'build')))

let games = {}

app.get('/', (req, res) => {
  res.sendFile('index.html', {root: __dirname + '/build'});
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
    else if (game.Y === undefined){
      game.Y = socket.id;
      game.room = room;
    }
    else
      return;

    console.log(`Player X: ${games[room].X}`);
    console.log(`Player Y: ${games[room].Y}`);

    socket.on('click', (squareNum) => {
      let game = games[room];

      if (game.isTurn(socket.id)){
        let status = game.handleSquareClick(squareNum);
        nsp.emit('new state', game.state);

        if (status.X)
          nsp.to(game.X).emit('new status', status.X);
        if (status.Y)
          nsp.to(game.Y).emit('new status', status.Y);

      } else {
        nsp.to(socket.id).emit('new status', "Not your turn!");
      }
    });

    socket.on('collapse click', (choice) => {
      let game = games[room];

      if (game.isTurn(socket.id) &&
          game.state.cycleMarks.includes(choice)){

        game.handleCollapse(choice);
        nsp.emit('new state', game.state);
      } else {
        nsp.to(socket.id).emit('new status', "Not your turn!");
      }
    });

    socket.on('request status', () => {
      let game = games[room];
      let status = `Welcome! You are player ${game.getPlayer(socket.id)}`;
      nsp.to(socket.id).emit('new status', status);
    });

  });

  res.sendFile('index.html', {root: __dirname + '/build'});
});


http.listen(port, () => {
  console.log(`listening on *:${port}`);
});
