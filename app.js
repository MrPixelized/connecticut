#!/usr/bin/env node

/* Imports */
const express = require('express')
const app = express()
const connecticut = require('./private/connecticut.js')
const helmet = require('helmet')

/* Set the template engine to EJS */
app.set('view engine', 'ejs')

/* Make the server use helmet for added security */
app.use(helmet())

/* Make sure the app uses the 'public' directory for static content */
app.use(express.static('public'))
server = app.listen(3000)

const io = require('socket.io')(server)

/* Handles for routes */
app.get('/', (req, res) => {
  res.render('index')
})

app.get('/play', (req, res) => {
  var gameId = req.query.gameId
  var action = req.query.action

  /* The player wants to join the game */
  if (action == 'join') {
    /* If the game does not yet exist, create it */
    if (!GameConnection.gamesInPlay[gameId]) {
      GameConnection.gamesInPlay[gameId] = new GameConnection(gameId)
    }

    /* Determine which color the player should be viewing the board as */
    if (!GameConnection.gamesInPlay[gameId].blackPlayer) {
      res.render('play', {gameId: gameId, viewer: 'black'})
      return
    } else if (!GameConnection.gamesInPlay[gameId].whitePlayer) {
      res.render('play', {gameId: gameId, viewer: 'white'})
      return
    }
  }

  /* In any other case, the player will join as a viewer */
  res.render('play', {gameId: gameId, viewer: 'viewer'})
})

/* Set up high-level event for incoming connections */
io.on('connection', (socket) => {
  /* A connected socket makes a request to join a game */
  socket.on('join', (game) => {
    id = game.gameId

    /* If the game does not exist, it cannot be joined */
    if (!GameConnection.gamesInPlay[id]) {
      return
    }

    /* Join the game */
    GameConnection.gamesInPlay[id].join(socket, game.viewer)
  })
})

/* A class to wrap around the connections to the players of a game,
 * as well as the id of the game and other metadata
 */
class GameConnection {
  /* Shared memory to keep trac of all played games */
  static gamesInPlay = {}

  constructor(gameId) {
    /* Set the game id and viewer */
    this.gameId = gameId

    /* Set default values */
    this.blackPlayer = null
    this.whitePlayer = null

    /* Intialize a list to contain all of the connections viewing the game */
    this.viewers = []

    this.game = new connecticut.Game()
  }

  /* Event handler for black move made */
  makeBlackMove(x, y) {
    this.game.makeMove(x, y, connecticut.Color.BLACK)

    this.sync()
  }

  /* Event handler for white move made */
  makeWhiteMove(x, y) {
    this.game.makeMove(x, y, connecticut.Color.WHITE)

    this.sync()
  }

  join(socket, viewer) {
    if (viewer == connecticut.Color.BLACK) {
      this.joinBlack(socket)
    } else if (viewer == connecticut.Color.WHITE) {
      this.joinWhite(socket)
    } else {
      this.joinViewer(socket)
    }

    this.update(socket)
  }

  /* Function to add a viewer to the game */
  joinViewer(socket) {
    this.viewers.push(socket)
  }

  /* Function to add a black player to the game */
  joinBlack(socket) {
    /* If there is no black player yet, make the given socket the black player,
     * otherwise let them join as a viewer
     */
    if (this.blackPlayer) {
      this.joinViewer(socket)
      return
    }

    this.blackPlayer = socket

    /* Make sure the new player can send moves to the server */
    socket.on('requestmove', (move) => {
      this.makeBlackMove(move.x, move.y)
    })

    /* Handle disconnected event */
    socket.on('disconnect', () => {
      this.blackPlayer = null
    })
  }

  /* Function to add a white player to the game */
  joinWhite(socket) {
    /* If there is no black player yet, make the given socket the black player,
     * otherwise let them join as a viewer
     */
    if (this.whitePlayer) {
      this.joinViewer(socket)
      return
    }

    this.whitePlayer = socket

    /* Make sure the new player can send moves to the server */
    socket.on('requestmove', (move) => {
      this.makeWhiteMove(move.x, move.y)
    })

    /* Handle disconnected event */
    socket.on('disconnect', () => {
      this.whitePlayer = null
    })
  }

  /* Synchronize the board between all viewers and players */
  sync() {
    this.update(this.blackPlayer)
    this.update(this.whitePlayer)

    for (var viewer of this.viewers) {
      this.update(viewer)
    }
  }

  /* Synchronize the board for a specific socket */
  update(socket) {
    if (socket == null) {
      return
    }

    /* Figure out the color of the given socket */
    let viewer = 'viewer'

    if (socket == this.whitePlayer) {
      viewer = connecticut.Color.WHITE
    }

    if (socket == this.blackPlayer) {
      viewer = connecticut.Color.BLACK
    }

    /* Send the sync event with the proper data to the client */
    socket.emit('sync', {
      squares: this.game.squares,
      viewer: viewer,
      winner: this.game.winner
    })
  }
}
