const WebSocket = require('ws')

class WebSocketServer {
	constructor (port, callback) {
		try {
			const wss = new WebSocket.Server({ port })
			wss.on('connection', attachWebsocket)
			callback()
		} catch (error) {
			console.log(error)
		}
	}
}

function attachWebsocket (ws) {
	ws.on('message', (message) => {
		console.log('received: %s', message)
	})
	setInterval(() => {
		console.log('Reloading page over websocket')
		ws.send('reload')
	}, 3000)
}

module.exports = WebSocketServer
