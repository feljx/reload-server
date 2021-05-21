import mime from 'mime'
import { readFile } from 'fs'

export function isTextFile (filepath: string) {
    const m = mime.getType(filepath)
    return (
        m.slice(0, 4) === 'text' || m === mime.getType('js') || m === mime.getType('mjs')
    )
}

export function CachePath (filepath: string) {
    const unixPath = unixifyPath(filepath)
    const regex = /\w+(\/.*)?$/
    const match = regex.exec(unixPath)
    const cachePath = (match && match[1]) || '/'
    return cachePath[cachePath.length - 1] === '/' ? cachePath + 'index.html' : cachePath
}

export function replaceAll (a: string, b: string, s: string) {
    while (s.includes(a)) {
        s = s.replace(a, b)
    }
    return s
}

export function unixifyPath (path: string) {
    const double_back = '\\\\'
    const single_back = '\\'
    const forward = '/'
    return replaceAll(single_back, forward, replaceAll(double_back, forward, path))
}

/**
 * Get binary file
 * @param {string} path
 * @returns {Promise}
 */
export function getBinaryFile (path: string) {
    return new Promise((resolve, reject) => {
        readFile(path, { encoding: null, flag: 'r' }, (err, data) => {
            if (err) reject(err)
            if (data) resolve(data)
        })
    })
}

/**
 * Get text file
 * @param {string} path
 * @returns {Promise}
 */
export function getTextFile (path: string) {
    return new Promise((resolve, reject) => {
        readFile(path, { encoding: 'utf8', flag: 'r' }, (err, data) => {
            if (err) reject(err)
            if (data) resolve(data)
        })
    })
}

export const SOCKET_SCRIPT_NAME = '_websocket.js'

/**
 * Inject websocket script into index.html data *
 * @param {string} data
 */
export function injectSocketScript (data: string) {
    const regex = /([^]+)(<body>\n?)(\s*)([^]+)(<\/body>)([^]+)/
    const [ _, rest_start, body_tag_open, indent, rest_mid, body_tag_close, rest_end ] =
        data.match(regex) || []
    const script_tag = `<script src="${SOCKET_SCRIPT_NAME}"></script>\n`
    return (
        rest_start +
        body_tag_open +
        indent +
        rest_mid +
        indent +
        script_tag +
        body_tag_close +
        rest_end
    )
}

/**
 * Get WebSocket script to serve
 * @param {number | string} port
 */
export function getSocketScript (port: number | string) {
    return `const webSocket = new WebSocket('ws://localhost:${port}')
webSocket.addEventListener('open', (event) => {
    console.log('Live reload: websocket connected')
    webSocket.addEventListener('message', (event) => {
        const reload = event.data === 'reload'
        if (reload) {
            window.location.reload()
        }
    })
})
`
}

/**
 * Higher-order function to create colorful loggers
 * @param {string} color
 * @returns {(...msgs: any[]) => void}
 */
export const log_in_color = (color: string) => (...msgs: any[]) =>
    console.log(color, ...msgs, '\x1b[0m')
export const logRed = log_in_color('\x1b[31m')
export const logCyan = log_in_color('\x1b[36m')
export const logGreen = log_in_color('\x1b[32m')
