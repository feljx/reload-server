const { PORT_HTTP, PORT_WEBSOCKET, HTTP, WEBSOCKET, LOCALHOST } = require('./constants')
const HTTPServer = require('./http')
const WebSocketServer = require('./websocket')

function greet (serverType, host, port) {
	const addressAndPort = `${host}:${port}`
	return function () {
		console.log(`-------> ${serverType} server listening @ ${addressAndPort}`)
	}
}

// Server creation greetings
const greetHTTP = greet(HTTP, LOCALHOST, PORT_HTTP)
const greetWebSocket = greet(WEBSOCKET, LOCALHOST, PORT_WEBSOCKET)

// Start HTTP and WebSocket servers
const httpServer = new HTTPServer(PORT_HTTP, greetHTTP)
const webSocketServer = new WebSocketServer(PORT_WEBSOCKET, greetWebSocket)
