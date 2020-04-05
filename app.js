const express = require('express')
const app = express()

/* Set the template engine to EJS */
app.set('view engine', 'ejs')

/* Make sure the app uses the 'public' directory for static content */
app.use(express.static('public'))
server = app.listen(3000)

/* Handles for routes */
app.get('/', (req, res) => {
  res.render('index')
})

const io = require('socket.io')(server)

/* Set up high-level event for incoming connections */
io.on('connection', (socket) => {

  var board = new GameConnection(socket)

  socket.on('requestmove', (move) => {
    board.makeMove(socket, move.x, move.y, move.color)
  })
})

/* A class to wrap around the connections to the players of a game,
 * as well as the id of the game and other metadata
 */
class GameConnection {
  constructor(player1, player2=null) {
    this.gameId = GameConnection.maxGameId++

    this.player1 = player1
    this.player2 = player2

    /* Intialize a list to contain all of the connections viewing the game */
    this.viewers = []

    this.game = new Game()
  }

  /* Event handler for move made */
  makeMove(socket, x, y, color) {
    /* If the event was actually sent by a player of the game,
     * try to make the move
     */
    if (socket == this.player1 || socket == this.player2) {
      this.game.setStone(x, y, color)
    }

    this.player1.emit('move', {x: x, y: y, color: this.game.squares[x][y]})

    if (this.player2) {
      this.player2.emit('move', {x: x, y: y, color: this.game.squares[x][y]})
    }

    for (viewer of this.viewers) {
      viewer.emit('move', {x: x, y: y, color: this.game.squares[x][y]})
    }
  }

  /* Event handler for player joined */
  joinPlayer(player) {
    if (!this.player2) {
      this.player2 = player
    } else {
      this.viewers.push(player)
    }
  }
}

GameConnection.maxGameId = 0

/* A class to contain an actual game state:
 * which side is to move, how large the board is, what the position looks like
 * timing information etc.
 */
class Game {
  constructor(boardSize=13) {
    /* The first player of a new game is always black */
    this.toPlay = Game.Color.BLACK

    this.size = boardSize

    /* Create a squares array to keep track of the game's state */
    this.squares = []

    /* Loop through the specified sizes to add squares into the square array */
    for (var x = 0; x < this.size; x++) {
      this.squares.push([])
      for (var y = 0; y < this.size; y++) {
        /* All squares will initially be empty */
        var square = Game.Color.EMPTY
        this.squares[x].push(square)
      }
    }
  }

  /* A function to switch the current player who's to play to the other side */
  endTurn() {
    this.toPlay *= -1
  }

  /* Tests if the given move is legal and places the stone if it is */
  setStone(x, y, color) {
    if (this.isLegalMove(x, y, color)) {
      this.squares[x][y] = color

      this.endTurn()
    }
  }

  isLegalMove(x, y, color) {
    return true;
  }
}

Game.Color = {
  WHITE:  1,
  EMPTY:  0,
  BLACK: -1
}
