/* A nicer interface for color values */
Color = {
  WHITE:  1,
  EMPTY:  0,
  BLACK: -1
}

/* A nicer interface for cardinal directions */
Walls = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3
}

/* A class to contain a connecticut game state:
 * which side is to move, how large the board is, what the position looks like
 * timing information etc.
 */
class Game {
  constructor(boardSize=13) {
    /* The first player of a new game is always black */
    this.toPlay = Color.BLACK

    this.size = boardSize

    this.winner = Color.EMPTY

    /* Create a squares array to keep track of the game's state */
    this.squares = []

    /* Loop through the specified sizes to add squares into the square array */
    for (var x = 0; x < this.size; x++) {
      this.squares.push([])
      for (var y = 0; y < this.size; y++) {
        /* All squares will initially be empty */
        var square = Color.EMPTY
        this.squares[x].push(square)
      }
    }
  }

  /* A function to switch the current player who's to play to the other side */
  endTurn() {
    this.toPlay *= -1
  }

  /* Function to make a move; check legality and set stones */
  makeMove(x, y, color) {
    if (this.isLegalMove(x, y, color)) {
      this.setStone(x, y, color)

      this.updateStones(x, y)

      this.winCondition(x, y)

      this.endTurn()
    }
  }

  /* Searches the board, starting at (x, y), to see if a player has won */
  winCondition(x, y) {
    this.found = {}

    /* Variables to keep track of to what walls this stone is connected */
    var north = false
    var south = false
    var east = false
    var west = false

    for (let connection of this.wallConnections(x, y)) {
      if (connection == Walls.NORTH) {
        north = true
      }

      if (connection == Walls.SOUTH) {
        south = true
      }

      if (connection == Walls.EAST) {
        east = true
      }

      if (connection == Walls.WEST) {
        west = true
      }
    }

    /* If the stone is connected to two opposite sides, the player has won */
    if (north && south || east && west) {
      this.winner = this.toPlay
    }
  }

  /* Yields what connections to what walls the given square has */
  * wallConnections(x, y) {
    this.found[[x, y]] = true

    /* Yield the proper connection if a stone is on an edge */
    if (x == 0) {
      yield Walls.WEST
    }

    if (x == this.size - 1) {
      yield Walls.EAST
    }

    if (y == 0) {
      yield Walls.NORTH
    }

    if (y == this.size - 1) {
      yield Walls.SOUTH
    }

    for (let [px, py] of this.getBridged(x, y)) {
      if (!this.found[[px, py]]) {
        for (let wallConnection of this.wallConnections(px, py)) {
          yield wallConnection
        }
      }
    }
  }

  /* Yields all stones which could be direct neighbors
   * in a bridge involving the given stone
   */
  * getBridged(x, y) {
    for (let dx of [-1, 1]) {
      for (let dy of [-1, 1]) {
        let px = x + dx
        let py = y + dy

        if (px < 0 || this.size <= px) {
          continue
        }

        if (this.squares[x][y] == this.squares[px][y]) {
          yield [px, y]
        }

        if (py < 0 || this.size <= py) {
          continue
        }

        if (this.squares[x][y] == this.squares[x][py]) {
          yield [x, py]
        }

        if (this.squares[x][y] == this.squares[px][py]) {
          yield [px, py]
        }
      }
    }
  }

  /* Set the stone at the given coordinate to the given color */
  setStone(x, y, color) {
    this.squares[x][y] = color
  }

  /* Searches through the board to capture any fallen stones,
   * the given x, y are the coordinates of a newly placed stone
   */
  updateStones(x, y) {
    for (let [px, py] of this.getAffected(x, y)) {
      /* If the affected square is of the affected color, update it */
      if (this.squares[px][py] == -this.squares[x][y]) {
        this.found = {}

        if (!this.isEdgeLinked(px, py)) {
          this.clearGroup(px, py)
        }
      }
    }
  }

  /* Recursively removes the given stone and all of its connections */
  clearGroup(x, y) {
    let groupColor = this.squares[x][y]

    this.setStone(x, y, Color.EMPTY)

    for (let [px, py] of this.linkedStones(x, y, groupColor)) {
        this.clearGroup(px, py)
    }
  }

  /* A recursive fun    this.setStone(x, y, Color.EMPTY)ction to test if a given stone and all of its children
   * are connected to an edge
   */
  isEdgeLinked(x, y) {
    /* Mark this stone as visited */
    this.found[[x, y]] = true

    /* If the stone is on the edge, it will return true */
    if (x == 0 || x == this.size - 1) {
      return true
    }

    if (y == 0 || y == this.size - 1) {
      return true
    }

    /* Loop through all linked stones */
    for (let [px, py] of this.linkedStones(x, y, this.squares[x][y])) {
      /* If a linked stone has been visited, don't examiate it */
      if (!this.found[[px, py]]) {
        if (this.isEdgeLinked(px, py)) {
          return true
        }
      }
    }

    /* If no children are linked to an edge, return false */
    return false
  }

  /* Gets all squares that could have lost a connection because of the
   * placement of the stone on x, y
   */
  * getAffected(x, y) {
    /* Loop through the four diagonally adjecent squares */
    for (let dx of [-1, 1]) {
      for (let dy of [-1, 1]) {
        let px = x + dx
        let py = y + dy

        if (0 < px && 0 < py && px < this.size - 1 && py < this.size - 1) {
          yield [px, py]
        }
      }
    }

    /* Loop through the lines that cross the given coordinate */
		for (let d of [-2, 2, -1, 1]) {
      let px = x + d
      let py = y + d

      if (0 < px && px < this.size - 1) {
        yield [px, y]
      }

      if (0 < py && py < this.size - 1) {
        yield [x, py]
      }
    }
	}

  /* Tests if the given move is legal */
  isLegalMove(x, y, color) {
    /* The move must be made by the appropriate player */
    if (color != this.toPlay) {
      return false
    }

    /* A piece can only be placed on an empty square */
    if (this.squares[x][y] != Color.EMPTY) {
      return false
    }

    /* Any move on the edge is always going to be legal */
    if (x == 0 || y == 0 || x == this.size - 1 || y == this.size - 1) {
      return true
    }

    /* If there is a link to another stone of the same color,
    * the move is legal
    */
    for (let square of this.linkedStones(x, y, color)) {
      return true
    }

    return false
  }

  /* Tests if the connection between x1, y1 and x2, y2 is broken by -1*color */
  isBroken(x1, y1, x2, y2, color) {
    /* We always want x1 and y1 to be smaller than their counterparts */
    if (x1 > x2) {
      [x1, x2] = [x2, x1]
    }

    if (y1 > y2) {
      [y1, y2] = [y2, y1]
    }

    /* Make lists to keep track of the coordinates of found obstructions */
    var xs = []
    var ys = []

    var opposite = -1 * color

    /* Loop through all squares in the rectangle with
     * (x1, y1) and (x2, y2) as its corners
     */
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        /* If there's a stone that could interfere with a connection,
         * store its x and y coordinates appropriately
         */
        if (this.squares[x][y] == opposite) {
          xs.push(x)
          ys.push(y)
        }
      }
    }

    /* Find the long axis of this rectangle.
     * If all rows of the rectangle across this axis contain an
     * obtrusive stone, the connection is broken
     */
    if (x2 - x1 > 1) {
      return !ys.every((val, i, arr) => val == arr[0])
    }

    return !xs.every((val, i, arr) => val == arr[0])
  }

  /* Returns all stones of the given color, a knights move away from
   * the given coordinates, that can be reached according to connecticut rules
   */
  * linkedStones(x, y, color) {
    for (let [px, py] of this.linkedSquares(x, y, color)) {
      if (this.squares[px][py] == color) {
        yield [px, py]
      }
    }
  }

  /* Get all squares to which a stone on x, y of color are linked,
   * with no opposing stones breaking the connections
   */
  * linkedSquares(x, y, color) {
    /* Loop through all squares that could be linked */
    for (let [px, py] of this.reachedSquares(x, y)) {
      /* If the connection is not broken, return the square */
      if (!this.isBroken(x, y, px, py, color)) {
        yield [px, py]
      }
    }
  }

  /* Generator function to return all coordinates that are
   * a knight's move away from the given square
   */
  * reachedSquares(x, y) {
    /* Get the set of four knight's moves along the y axis */
    for (var dx of [-1, 1]) {
      for (var dy of [-2, 2]) {
        let px = x + dx
        let py = y + dy

        if (px >= 0 && px < this.size && py >= 0 && py < this.size) {
          yield [px, py]
        }
      }
    }

    /* Get the set of four knight's moves along the x axis */
    for (var dy of [-1, 1]) {
      for (var dx of [-2, 2]) {
        let px = x + dx
        let py = y + dy

        if (px >= 0 && px < this.size && py >= 0 && py < this.size) {
          yield [px, py]
        }
      }
    }
  }
}

/* Make sure this file can be imported into an app */
module.exports = {
  Game: Game,
  Color: Color
}
