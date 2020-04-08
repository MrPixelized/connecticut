var Color = {
  WHITE:  1,
  EMPTY:  0,
  BLACK: -1
}

class Square extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static get observedAttributes() {
    return ['x', 'y'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'x':
        this.x = newValue
        break
      case 'y':
        this.y = newValue
        break
    }
  }

  /* Is given a number: 1 for white, -1 for black or 0 for empty,
   * and sets various different attributes to make sure the current
   * square displays the proper piece according to this string.
   */
  setStone(color = Color.EMPTY) {
    this.color = color
    this.overlay.src = this.texture
  }

  /* Wrapper function for the square's color */
  get color() {
    return this.container.getAttribute('color')
  }

  set color(color) {
    this.container.setAttribute('color', color)
  }

  /* Wrapper function for the square's tile texture */
  get tileTexture() {
    return this.parentBoard.tileTexture
  }

  /* Returns the texture used for a stone of a specified color */
  get texture() {
    /* If this stone does not have a specific texture, we look for the
     * color of the board's viewer
     */
    if (this.color == Color.BLACK || this.parentBoard.viewer == Color.BLACK) {
      return this.parentBoard.blackTexture
    }

    if (this.color == Color.WHITE || this.parentBoard.viewer == Color.WHITE) {
      return this.parentBoard.whiteTexture
    }

    return ''
  }

  connectedCallback() {
    /* Set an easy to access reference to the board for metadata */
    this.parentBoard = this.getRootNode().host

    /* A square must be initialized with a location */
    if (!this.hasAttribute('x')) {
      throw new Error("Element doesn't have an x value set.")
    }

    if (!this.hasAttribute('y')) {
      throw new Error("Element doesn't have an y value set.")
    }

    /* Initialize subelements for the shadow root */
    this.tile = document.createElement('img')
    this.overlay = document.createElement('img')
    this.container = document.createElement('div')

    /* Set their attributes */
    this.tile.id = 'tile'
    this.tile.src = this.tileTexture
    /* Make the tile un-draggable */
    this.tile.ondragstart = (e) => {return false}

    this.overlay.id = 'overlay'
    this.overlay.src = this.texture
    /* Make the overlay un-draggable */
    this.overlay.ondragstart = (e) => {return false}

    this.container.id = 'container'

    this.shadowRoot.innerHTML += `
      <style>
        #container {
          user-select: none;
        }

        #container[color="${Color.EMPTY}"] #overlay:hover {
          opacity: 0.5;
        }

        #container[color="${Color.EMPTY}"] #overlay {
          opacity: 0;
        }

        #overlay[src=""] {
            display: none;
        }

        #overlay {
          opacity: 1;

          display: block;
          position: absolute;

          top: 0;
          left: 0;
          bottom: 0;
          right: 0;

          border-radius: 50%;

          user-select: none;
        }

        #tile {
          display: block;

          width: calc(100% + 1.5px);
          height: calc(100% + 1.5px);
          margin: -0.75px;

          user-select: none;
        }

        :host {
          display: block;
          position: relative;
        }
      </style>`

    this.container.appendChild(this.tile)
    this.container.appendChild(this.overlay)
    this.shadowRoot.appendChild(this.container)

    /* Set a custom event to propagate upwards when the square is clicked. */
    this.onclick = (e) => {
      var requestMoveEvent = new CustomEvent('requestmove', {
        detail: {
          x: this.x,
          y: this.y
        }
      })

      this.parentBoard.dispatchEvent(requestMoveEvent)
    }

    /* Set the right texture for the stone */
    this.setStone()
  }
}

window.customElements.define('connecticut-square', Square)
