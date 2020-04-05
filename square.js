var Color = {
  WHITE:  1,
  EMPTY:  0,
  BLACK: -1
}

class Square extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML += `
      <style>
        #container {
          user-drag: none;
        }
        
        #container[color="${Color.EMPTY}"] #overlay:hover {
          opacity: 0.5;
        }

        #container[color="${Color.EMPTY}"] #overlay {
          opacity: 0;
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

          user-drag: none;
          -moz-user-select: none;
          -webkit-user-drag: none;
        }

        #tile {
          display: block;
         
          width: calc(100% + 1.5px);
          height: calc(100% + 1.5px);
          margin: -0.75px;
          
          user-drag: none;
          -moz-user-select: none;
          -webkit-user-drag: none;
        }

        :host {
          display: block;
          position: relative;
        }
      </style>`
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
    this.container.setAttribute('color', color)
    this.overlay.src = this.getTexture(this.color)
  }

  /* Returns the texture used for a stone of a specified color */
  getTexture(color) {
    if (color == Color.WHITE) {
      return this.parentBoard.whiteTexture
    } else if (color == Color.BLACK) {
      return this.parentBoard.blackTexture
    } else if (color == Color.EMPTY) {
      return this.getTexture(this.parentBoard.viewer)
    }
  }

  connectedCallback() {
    this.parentBoard = this.getRootNode().host
    
    this.tileTexture = this.parentBoard.tileTexture

    if (!this.hasAttribute('x')) {
      throw new Error("Element doesn't have an x value set.")
    }

    if (!this.hasAttribute('y')) {
      throw new Error("Element doesn't have an y value set.")
    }

    this.tile = document.createElement('img')
    this.overlay = document.createElement('img')
    this.container = document.createElement('div')

    this.tile.id = 'tile'
    this.tile.src = this.tileTexture

    this.overlay.id = 'overlay'
    this.overlay.src = this.getTexture(this.color)

    this.container.id = 'container'
    this.container.setAttribute('color', this.color)

    this.container.appendChild(this.tile)
    this.container.appendChild(this.overlay)
    this.shadowRoot.appendChild(this.container)

    this.onclick = (e) => {
      var requestMoveEvent = new CustomEvent('requestmove', {
        detail: {
          x: this.x,
          y: this.y
        }
      })
      
      this.parentBoard.dispatchEvent(requestMoveEvent)
    }

		this.onmouseenter = (e) => {
			if (this.color == Color.EMPTY) {
				this.setStone()
			}
		}

    this.setStone()
  }
}