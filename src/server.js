const express = require('express')
const { dirname } = require('path')
const mime = require('mime')
const { Watcher } = require('./watcher')
const WebsocketServer = require('ws').Server
const { getBinaryFile, getTextFile, unixifyPath } = require('./utils')
const DEFAULT_PORT = 8000

function getMime (filepath) {
    // @ts-ignore
    return mime.lookup(filepath)
}

function isTextFile (filepath) {
    // @ts-ignore
    const m = mime.lookup(filepath)
    // @ts-ignore
    return m.slice(0, 4) === 'text' || m === mime.lookup('js') || m === mime.lookup('mjs')
}

function CachePath (filepath) {
    const unixPath = unixifyPath(filepath)
    const regex = /\w+(\/.*)?$/
    const match = regex.exec(unixPath)
    const cachePath = (match && match[1]) || '/'
    return cachePath[cachePath.length - 1] === '/' ? cachePath + 'index.html' : cachePath
}

function CuteServer ({ inputPath, servedPath, _port, effect }) {
    try {
        // initialize file data cache
        const cache = {}
        // initialize app
        const app = express()
        // normalize port argument
        const port = Number(_port) || DEFAULT_PORT
        // create Watcher object (wraps chokidar)
        const watcher = Watcher(inputPath)
        // cache files callback
        const cacheFiles = (filepath) => {
            const fileData = isTextFile(filepath)
                ? getTextFile(filepath)
                : getBinaryFile(filepath)
            fileData
                .then((data) => void (cache[CachePath(filepath)] = data))
                .catch((error) => {
                    throw new Error(`ERROR reading data from server: ${error}`)
                })
        }
        // reload client thru websocket
        const reloadClient = (filepath) => {}
        // on file change, apply file paths to callbacks
        watcher.onUpdate(cacheFiles)

        // HTTP and WebSocket servers instances
        let nodeHttpServer
        let websocketServer
        // CuteServer instance
        const instance = Object.freeze({
            start () {
                // routing
                app.get('/*', (req, res) => {
                    const requestedPath =
                        req.url[req.url.length - 1] === '/'
                            ? req.url + 'index.html'
                            : req.url
                    const data = cache[requestedPath]
                    console.log(`REQUEST ${req.url} MAPPED TO ${requestedPath}`)
                    res.set('Content-Type', getMime(requestedPath))
                    res.send(data)
                })
                // initialize HTTP server
                nodeHttpServer = app.listen(port, () => {
                    console.log(`Listening at http://localhost:${port}`)
                })
                // initialize WebSocket server
                websocketServer = new WebsocketServer({ port: socket_port })
                socket_server.on('connection', (ws) => {
                    socket_connection = ws
                })
                socket_server.on('close', () => {
                    socket_connection = null
                })
            },
            //
            stop () {
                if (nodeHttpServer) nodeHttpServer.close()
            }
        })
        // return CuteServer instance
        return instance
    } catch (error) {
        console.log(new Error(`ERROR thrown in CuteServer instance code: ${error}`))
    }
}

module.exports = { CuteServer }
