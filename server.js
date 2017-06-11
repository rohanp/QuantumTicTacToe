import path from 'path';
import express from 'express';
import Game from './Game.js'

const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http);
const port = 3001;

app.use(express.static(path.join(__dirname, 'build')))

let games = {}

app.get('/:room', (req, res) => {
  console.log(req.params)
  let room = req.params.room
  let nsp = io.of(`/${room}`);

  games[room] = new Game();

  nsp.on('connection', (socket) => {
    console.log("A user connected!");

    socket.on('click', (squareNum) => {
      console.log(`player clicked on ${squareNum}`);

      games[room].handleSquareClick(squareNum);
      console.log(games[room].state);

      nsp.emit('new state', games[room].state);
    });

    socket.on('collapse click', (choice) => {
      games[room].handleCollapse(choice);

      nsp.emit('new state', games[room].state);
    })

  })

  res.sendFile('index.html', {root: __dirname + '/build'});
});


http.listen(port, () => {
  console.log(`listening on *:${port}`);
});
