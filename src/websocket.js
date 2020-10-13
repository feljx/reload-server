const WebSocket = require('ws')

class WebSocketServer {
    constructor (port) {
        try {
            const wss = new WebSocket.Server({ port })
            wss.on('connection', (ws) => {
                this.ws = ws
            })
        } catch (error) {
            console.log(error)
        }
    }
    reload () {
        if (this.ws) {
            this.ws.send('reload')
        }
    }
}

module.exports = WebSocketServer
