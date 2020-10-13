const chokidar = require('chokidar')
const {
    PORT_HTTP,
    PORT_WEBSOCKET,
    HTTP,
    WEBSOCKET,
    LOCALHOST,
} = require('./constants')
const HTTPServer = require('./http')
const WebSocketServer = require('./websocket')

// Start HTTP and WebSocket servers
const httpServer = new HTTPServer(PORT_HTTP)
const webSocketServer = new WebSocketServer(PORT_WEBSOCKET)

const watcher = chokidar.watch(process.cwd(), {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
})

const changeEvents = [ 'add', 'change', 'unlink', 'addDir', 'unlinkDir' ]

for (const eventType of changeEvents) {
    watcher.on(eventType, () => webSocketServer.reload())
}
