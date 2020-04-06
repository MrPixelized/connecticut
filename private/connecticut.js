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
    for (dx of (-1, 1)) {
      for (dy of (-2, 2)) {
        let i = x + dx
        let j = y + dy

        if (0 < i && i < this.size && 0 < j && j < this.size) {
          yield [i, j]
        }
      }
    }

    /* Get the set of four knight's moves along the x axis */
    for (dx of (-2, 2)) {
      for (dy of (-1, 1)) {
        let i = x + dx
        let j = y + dy

        if (0 < i && i < this.size && 0 < j && j < this.size) {
          yield [i, j]
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
