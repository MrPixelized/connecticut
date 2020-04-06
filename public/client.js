/* Add the client functionality to all boards on the page */
for (board of document.getElementsByTagName('connecticut-board')) {
	/* Each board gets a unique socket for server communication */
	board.socket = io.connect()

	/* Make sure the board listens for whole board syncs from the server */
	board.socket.on('sync', (boardState) => {
		board.syncSquares(boardState.squares)
		board.viewer = boardState.viewer
	})

	/* Notify the server of a new user to join the board */
	board.socket.emit('join', {
		gameId: board.gameid,
	})

	/* Add an event to the board that sends a message to the server when a
	 * possible move is made
	 */
  board.addEventListener('requestmove', (e) => {
		/* Send move data */
		board.socket.emit('requestmove', {
			x: e.detail.x,
			y: e.detail.y,
			color: board.viewer,
			id: board.gameId
		})
  })
}
