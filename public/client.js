/* Add the client functionality to all boards on the page */
for (board of document.getElementsByTagName('connecticut-board')) {
	/* Each board gets a unique socket for server communication */
	board.socket = io.connect('http://localhost:3000')

	/* Make sure the board listens for updates from the server */
	board.socket.on('move', (move) => {
		board.setStone(move.x, move.y, move.color)
	})

	/* Add an event to the board that sends a message to the serve when a
	 * possible move is made
	 */
  board.addEventListener('requestmove', (e) => {
		/* Send move data */
		board.socket.emit('requestmove', {
			x: e.detail.x,
			y: e.detail.y,
			color: board.viewer
		})
  })
}
