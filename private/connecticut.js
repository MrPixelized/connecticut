/* A nicer interface for color values */
Color = {
  WHITE:  1,
  EMPTY:  0,
  BLACK: -1
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

  /* Tests if the given move is legal and places the stone if it is */
  setStone(x, y, color) {
    if (this.isLegalMove(x, y, color)) {
      this.squares[x][y] = color

      this.endTurn()
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
  }

  /* Tests if the connection between x1, y1 and x2, y2 is broken by -1*color */
  isBroken(x1, y1, x2, y2, color) {
    // var dx = x1 - x2
    // var dy = y1 - y2
    //
    // var c = []
    //
    // for (let x = dx; x != 0; x -= Math.sign(dx)) {
    //   for (let y = dy; y != 0; y -= Math.sign(dy)) {
    //     if (this.squares[x2 + x][y2 + y] == -1*color) {
    //       c.push()
    //     }
    //   }
    // }
    //
    // if (dx > 1) {
    //   x
    // }
  }

  /* Get all squares to which a stone on x, y of color are linked,
   * with no opposing stones breaking the connections
   */
  * linkedSquares(x, y, color) {
    for ([potentialX, potentialY] of this.reachedSquares(x, y)) {
      if (!isBroken(potentialX, potentialY, x, y, color)) {
        yield [potentialX, potentialY]
      }
    }
  }

  /* Generator function to return all coordinates that are
   * a knight's move away from the given square
   */
  * reachedSquares(x, y) {
    /* Get the set of four knight's moves along the y axis */
    for (a of (-1, 1)) {
      for (b of (-2, 2)) {
        let x1 = x + a
        let y1 = y + b
        let x2 = x + b
        let y2 = y + a

        if (0 < x1 && x1 < this.size && 0 < y1 && y1 < this.size) {
          yield [i, j]
        }

        if (0 < x2 && x2 < this.size && 0 < y2 && y2 < this.size) {
          yield [k, l]
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
