import { extname } from 'path'
import { readFile } from 'fs'

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

export function hasFolderFormat (str: string) {
    return !!str && extname(str) === ''
}

export function hasPortFormat (str: string) {
    const num = Number(str)
    return !isNaN(num) && num > 0 && num < 10000
}

export function hasScriptFormat (str: string) {
    return !!str && extname(str) === '.js'
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

/**
 * Inject websocket script into index.html data *
 * @param {string} data
 */
export function injectSocketScript (data: string) {
    const regex = /([^]+)(<body>\n?)(\s*)([^]+)(<\/body>)([^]+)/
    const [ _, rest_start, body_tag_open, indent, rest_mid, body_tag_close, rest_end ] =
        data.match(regex) || []
    const script_tag = '<script src="_websocket.js"></script>\n'
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
    return `const url = 'ws://localhost:${port}'
const webSocket = new WebSocket(url)
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
