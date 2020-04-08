class ConnecticutBoard extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    /* Set default values. */
    this.tileTexture = 'assets/tiles/default_tile.svg'
    this.boardTexture = 'assets/boards/default_board.jpg'
    this.size = 13
    this.viewer = Color.BLACK
    this.blackTexture = 'assets/stones/default_black.svg'
    this.whiteTexture = 'assets/stones/default_white.svg'

    /* Preload images */
		document.createElement('img').src = this.blackTexture
		document.createElement('img').src = this.whiteTexture
  }

  static get observedAttributes() {
    return ['size', 'boardtexture', 'tiletexture', 'viewer', 'gameid']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'size':
        this.size = newValue
        break
      case 'boardtexture':
        this.boardTexture = newValue
        break
      case 'tiletexture':
        this.tileTexture = newValue
        break
      case 'gameid':
        this.gameid = newValue
        break
      case 'viewer':
        if (newValue == 'white') {
          this.viewer = Color.WHITE
        } else if (newValue == 'black') {
          this.viewer = Color.BLACK
        } else {
          this.viewer = 'viewer'
        }
        break
    }
  }

  connectedCallback() {
    /* Set board background */
    this.board = document.createElement('img')
		this.board.id = 'board'
    this.board.src = this.boardTexture

    /* Generate all squares of the board, put them inside a 2d array,
     * and add them to the HTML grid
     */
    this.grid = document.createElement('div')
		this.grid.id = 'grid'

    this.squares = []

    /* Loop through the specified sizes add new squares
     * into the square array
     */
    for (var y = 0; y < this.size; y++) {
      this.squares.push([])
      for (var x = 0; x < this.size; x++) {
        var square = document.createElement('connecticut-square')
        square.setAttribute('x', x)
        square.setAttribute('y', y)

        this.squares[y].push(square)
        this.grid.appendChild(square)
      }
    }

    /* Make sure squares is indexed by [x][y] instead of [y][x] */
    this.squares = this.squares[0].map((_, i) => this.squares.map(x => x[i]))

    /* Create a container for the board and grid,
		 * and add everything to the document
     */
    this.container = document.createElement('div')
    this.container.id = 'container'

    /* Set the CSS for the child elements of the board */
		this.shadowRoot.innerHTML += `
      <style>
        #board {
          position: relative;
          display: block;

          width: 100%;
        }

        #grid {
          position: absolute;
          display: grid;

          top: 0;
          left: 0;
          bottom: 0;
          right: 0;

          grid-template-columns: repeat(${this.size}, 1fr);
          grid-template-rows: repeat(${this.size}, 1fr);
        }

        #container {
          position: relative;
          display: block;

          height: 100%;
          width: 100%;

          overflow: hidden;
          border-radius: calc(50% / ${this.size});
        }
      </style>`

		/* Append children */
    this.container.appendChild(this.board)
    this.container.appendChild(this.grid)
    this.shadowRoot.appendChild(this.container)
  }

  /* Takes in a number: 1 for white, 0 for empty, -1 for black,
   * and sets the stone at the given coordinates to that value.
   */
  setStone(x, y, color = Color.EMPTY) {
    this.squares[x][y].setStone(color)
  }

  /* Takes in an array of squares (-1, 0, 1)
   * and updates the squares array accordingly
   */
  syncSquares(squares) {
    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        this.setStone(x, y, squares[x][y])
      }
    }
  }
}

window.customElements.define('connecticut-board', ConnecticutBoard)
