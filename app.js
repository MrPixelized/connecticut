const express = require('express')
const app = express()
const connecticut = require('./private/connecticut.js')

/* Set the template engine to EJS */
app.set('view engine', 'ejs')

/* Make sure the app uses the 'public' directory for static content */
app.use(express.static('public'))
server = app.listen(3000)

/* Handles for routes */
app.get('/', (req, res) => {
  res.render('index')
})

app.get('/play', (req, res) => {
  res.render('play', {gameId: req.query.gameId})
})

const io = require('socket.io')(server)

gamesInPlay = {}

/* Set up high-level event for incoming connections */
io.on('connection', (socket) => {
  /* A connected user makes a request to join a game */
  socket.on('join', (game) => {
    id = game.gameId

    if (!gamesInPlay[id]) {
      /* If the game does not exist, create it */
      board = new GameConnection(id)

      /* Add the player to the game */
      board.joinUser(socket)

      /* Store the game connection in the global list of game connections */
      gamesInPlay[id] = board
    } else {
      /* Otherwise, join the game */
      gamesInPlay[id].joinUser(socket)
    }

    /* After all is said and done, synchronize the new board to all users */
    gamesInPlay[id].sync()
  })
})

/* A class to wrap around the connections to the players of a game,
 * as well as the id of the game and other metadata
 */
class GameConnection {
  constructor(gameId) {
    /* Set the game id */
    this.gameId = gameId

    this.player1 = null
    this.player2 = null

    /* Intialize a list to contain all of the connections viewing the game */
    this.viewers = []

    this.game = new connecticut.Game()
  }

  /* Event handler for move made */
  makeMove(socket, x, y, color) {
    /* If the event was actually sent by a player of the game,
     * try to make the move
     */
    if (socket == this.player1 || socket == this.player2) {
      this.game.setStone(x, y, color)
    }

    /* Synchronize the new board with all players and viewers */
    this.sync()
  }

  /* Event handler for player joined */
  joinUser(user) {
    /* If the players have already joined, the new user is a viewer */
    if (this.player1 && this.player2) {
      this.joinViewer(user)
    } else {
      this.joinPlayer(user)
    }
  }

  /* Function to add a viewer to the game */
  joinViewer(user) {
    this.viewers.push(user)
  }

  /* Function to add a player to the game */
  joinPlayer(user) {
    if (!this.player1) {
      this.player1 = user
    } else {
      this.player2 = user
    }

    /* Make sure the new player can send moves to the server */
    user.on('requestmove', (move) => {
      this.makeMove(user, move.x, move.y, move.color)
    })

    /* Handle disconnected event */
    user.on('disconnected', () => {
      if (user == this.player1) {
        this.player1 = null
      } else {
        this.player2 = null
      }
    })
  }

  /* Synchronize the board between all viewers and players */
  sync() {
    this.updateUser(this.player1)
    this.updateUser(this.player2)

    for (var viewer of this.viewers) {
      this.updateUser(viewer)
    }
  }

  /* Synchronize the board for a specific user */
  updateUser(user) {
    if (user == null) {
      return
    }

    /* Figure out the color of the given user */
    let viewer = connecticut.Color.BLACK

    if (user == this.player2) {
      viewer = connecticut.Color.WHITE
    }

    let squares = this.game.squares

    /* Send the sync event with the proper data to the client */
    user.emit('sync', {
      squares: squares,
      viewer: viewer
    })
  }
}
