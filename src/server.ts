import express from 'express'
import mime from 'mime'
import WebSocket from 'ws'
import { Watcher } from './watcher'
import { Arguments } from './args'
import {
    CachePath,
    getBinaryFile,
    getSocketScript,
    getTextFile,
    injectSocketScript,
    isTextFile,
    SOCKET_SCRIPT_NAME,
    unixifyPath
} from './utils'
import { Server as HttpServer } from 'http'

interface Cache {
    [key: string]: any
}

interface LiveReloadServerInstance {
    start: Function
    stop: Function
}

export default function LiveReloadServer ({
    inputPath,
    servedPath,
    _port,
    effect
}: Arguments): Readonly<LiveReloadServerInstance> {
    try {
        // normalize port argument
        const port = Number(_port)
        const websocketPort = port + 1
        // initialize file data cache
        const cache: Cache = {}
        cache[`/${SOCKET_SCRIPT_NAME}`] = getSocketScript(websocketPort)
        // initialize app
        const app = express()
        // create Watcher object (wraps chokidar)
        const watcher = Watcher(inputPath)
        // HTTP and WebSocket servers instances
        let nodeHttpServer: HttpServer
        let websocketServer: WebSocket.Server
        let socket: WebSocket | null

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

        // LiveReloadServer instance
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
                    res.set('Content-Type', mime.getType(requestedPath))
                    res.send(data)
                })
                // initialize HTTP server
                nodeHttpServer = app.listen(port, () => {
                    console.log(`Listening at http://localhost:${port}`)
                })
                // initialize WebSocket server
                websocketServer = new WebSocket.Server({ port: websocketPort })
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
        // return LiveReloadServer instance
        return instance
    } catch (error) {
        throw new Error(`ERROR thrown in LiveReloadServer instance code: ${error}`)
    }
}
