class GamesList extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    /* Make a dictionary to keep track of all of the games by id */
    this.games = {}

    /* Create a socket for a live updating games feed */
    this.socket = io.connect()
    this.socket.on('startgame', (game) => {
      this.games[game.gameId] = document.createElement('game-item')
    })
  }

  connectedCallback() {
  }
}

class GameItem extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    /* Default values */
    this.setAttribute('playerone') = '...'
    this.setAttribute('playertwo') = '...'
  }

  static get observedAttributes() {
    return ['playerone', 'playertwo']
  }

  /* Getters and setters used to make playerOne and playerTwo
   * interface with visible html elements
   */
  set playerOne(name) {
    this.playerOneText.innerHTML = name
  }

  get playerOne() {
    return this.playerOneText.innerHTML
  }

  set playerTwo(name) {
    this.playerOneText.innerHTML = name
  }

  get playerTwo() {
    return this.playerTwo.innerHTML
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'playerone':
        this.playerOne = newValue
        break
      case 'playertwo':
        this.playerTwo = newValue
        break
    }
  }

  connectedCallback() {
    this.playerOneText = document.createElement('p')
    this.playerTwoText = document.createElement('p')

    this.container = document.createElement('div')
  }
}

window.customElements.define('game-item', GameItem)
window.customElements.define('games-list', GamesList)
