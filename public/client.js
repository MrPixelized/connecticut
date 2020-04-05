for (board of document.getElementsByTagName('connecticut-board')) {
  board.addEventListener('requestmove', (e) => {
		let x = e.detail.x
		let y = e.detail.y

		let square = board.squares[x][y]
		

		if (square.color == Color.WHITE) {
    	board.setStone(x, y, Color.BLACK)
		}
		else if (square.color == Color.BLACK) {
			board.setStone(x, y, Color.EMPTY)
		}
		else {
			board.setStone(x, y, board.viewer)
			board.viewer = board.viewer == Color.WHITE ? Color.BLACK : Color.WHITE
		}

		
		console.log(`[${x}, ${y}] to ${square.color}`)
  })
}