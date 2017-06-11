import path from 'path';
import express from 'express';
import Game from './Game.js'

const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http);
const port = 3001;

app.use(express.static(path.join(__dirname, 'build')))

app.get('/:room', (req, res) => {
  console.log(req.params)
  let room = req.params.room
  let nsp = io.of(`/${room}`);
  console.log("here")

  nsp.on('connection', (socket) => {
    console.log("A user connected!");

    let game = new Game();

    socket.on('click', (squareNum) => {
      console.log(`player clicked on ${squareNum}`);

      game.handleSquareClick(squareNum);
      console.log(game.state);

      nsp.emit('new state', game.state);
    });

    socket.on('collapse click', (choice) => {
      game.handleCollapse(choice);

      nsp.emit('new state', game.state);
    })

  })

  res.sendFile('index.html', {root: __dirname + '/build'});
});


http.listen(port, () => {
  console.log(`listening on *:${port}`);
});
