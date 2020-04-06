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

  isLegalMove(x, y, color) {
    return color == this.toPlay
  }
}

/* Make sure this file can be imported into an app */
module.exports = {
  Game: Game,
  Color: Color
}
