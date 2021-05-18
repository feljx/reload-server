import express from 'express'
import mime from 'mime'
import WebSocket, { Server as WebsocketServer } from 'ws'
import { Watcher } from './watcher'
import { Arguments } from './cli'
import {
    getBinaryFile,
    getSocketScript,
    getTextFile,
    injectSocketScript,
    SOCKET_SCRIPT_NAME,
    unixifyPath
} from './utils'
import { Server as HttpServer } from 'http'

const DEFAULT_PORT = 8000

function getMime (filepath: string) {
    return mime.getType(filepath)
}

function isTextFile (filepath: string) {
    const m = mime.getType(filepath)
    return (
        m.slice(0, 4) === 'text' || m === mime.getType('js') || m === mime.getType('mjs')
    )
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
        // normalize port argument
        const port = Number(_port) || DEFAULT_PORT
        const websocketPort = port + 1
        // initialize file data cache
        const cache: Cache = {}
        cache[`/${SOCKET_SCRIPT_NAME}`] = getSocketScript(websocketPort)
        // initialize app
        const app = express()
        // create Watcher object (wraps chokidar)
        const watcher = Watcher(inputPath)
        // cache files callback
        const cacheFiles = (filepath: string) => {
            const fileReaderFn = isTextFile(filepath) ? getTextFile : getBinaryFile
            const cachePath = CachePath(filepath)
            const isIndexHtml = cachePath.includes('index.html')
            const cacheData = (isIndexHtml: boolean) => (data: any) =>
                void ((cache as any)[cachePath] = isIndexHtml
                    ? injectSocketScript(data)
                    : data)
            fileReaderFn(filepath).then(cacheData(isIndexHtml)).catch((error) => {
                throw new Error(`ERROR reading data from server: ${error}`)
            })
        }
        // reload client thru websocket
        const reloadClient = () => {
            if (socket) {
                socket.send('reload')
            }
        }
        // on file change, cache files and reload client
        const cacheFilesAndReload = (path: string) => {
            cacheFiles(path)
            reloadClient()
        }
        watcher.onUpdate(cacheFilesAndReload)

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
                    // console.log(`REQUEST ${req.url} MAPPED TO ${requestedPath}`)
                    res.set('Content-Type', getMime(requestedPath))
                    res.send(data)
                })
                // initialize HTTP server
                nodeHttpServer = app.listen(port, () => {
                    console.log(`Listening at http://localhost:${port}`)
                })
                // initialize WebSocket server
                websocketServer = new WebsocketServer({ port: websocketPort })
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
