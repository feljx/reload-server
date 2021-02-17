import express from 'express'
import mime from 'mime'
import WebSocket, { Server as WebsocketServer } from 'ws'
import { Watcher } from './watcher'
import { Arguments } from './cli'
import { getBinaryFile, getTextFile, unixifyPath } from './utils'
import { Server as HttpServer } from 'http'

const DEFAULT_PORT = 8000

function getMime (filepath: string) {
    // @ts-ignore
    return mime.lookup(filepath)
}

function isTextFile (filepath: string) {
    // @ts-ignore
    const m = mime.lookup(filepath)
    // @ts-ignore
    return m.slice(0, 4) === 'text' || m === mime.lookup('js') || m === mime.lookup('mjs')
}

function CachePath (filepath: string) {
    const unixPath = unixifyPath(filepath)
    const regex = /\w+(\/.*)?$/
    const match = regex.exec(unixPath)
    const cachePath = (match && match[1]) || '/'
    return cachePath[cachePath.length - 1] === '/' ? cachePath + 'index.html' : cachePath
}

interface Cache {
    [key: string]: any
}

interface CuteServerInstance {
    start: Function
    stop: Function
}

export default function CuteServer ({
    inputPath,
    servedPath,
    _port,
    effect
}: Arguments): Readonly<CuteServerInstance> {
    try {
        // initialize file data cache
        const cache: Cache = {}
        // initialize app
        const app = express()
        // normalize port argument
        const port = Number(_port) || DEFAULT_PORT
        // create Watcher object (wraps chokidar)
        const watcher = Watcher(inputPath)
        // cache files callback
        const cacheFiles = (filepath: string) => {
            const fileData = isTextFile(filepath)
                ? getTextFile(filepath)
                : getBinaryFile(filepath)
            fileData
                .then((data) => void ((cache as any)[CachePath(filepath)] = data))
                .catch((error) => {
                    throw new Error(`ERROR reading data from server: ${error}`)
                })
        }
        // reload client thru websocket
        const reloadClient = (filepath: string) => {}
        // on file change, apply file paths to callbacks
        watcher.onUpdate(cacheFiles)

        // HTTP and WebSocket servers instances
        let nodeHttpServer: HttpServer
        let websocketServer: WebsocketServer
        let socket: WebSocket | null
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
                websocketServer = new WebsocketServer({ port: port + 1 })
                websocketServer.on('connection', (ws) => {
                    socket = ws
                })
                websocketServer.on('close', () => {
                    socket = null
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
        throw new Error(`ERROR thrown in CuteServer instance code: ${error}`)
    }
}
