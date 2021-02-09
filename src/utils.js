const { extname } = require('path')
const { readFile } = require('fs')

function replaceAll (a, b, s) {
    while (s.includes(a)) {
        s = s.replace(a, b)
    }
    return s
}

function unixifyPath (path) {
    const double_back = '\\\\'
    const single_back = '\\'
    const forward = '/'
    return replaceAll(single_back, forward, replaceAll(double_back, forward, path))
}

function hasFolderFormat (str) {
    return str && extname(str) === ''
}

function hasPortFormat (str) {
    const num = Number(str)
    return !isNaN(num) && num > 0 && num < 10000
}

function hasScriptFormat (str) {
    return str && extname(str) === '.js'
}

/**
 * Get binary file
 * @param {string} path
 * @returns {Promise}
 */
function getBinaryFile (path) {
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
function getTextFile (path) {
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
function injectSocketScript (data) {
    const regex = /([^]+)(<body>\n?)(\s*)([^]+)(<\/body>)([^]+)/
    const [
        _,
        rest_start,
        body_tag_open,
        indent,
        rest_mid,
        body_tag_close,
        rest_end
    ] = data.match(regex)
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
function getSocketScript (port) {
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
const log_in_color = (color) => (...msgs) => console.log(color, ...msgs, '\x1b[0m')
const logRed = log_in_color('\x1b[31m')
const logCyan = log_in_color('\x1b[36m')
const logGreen = log_in_color('\x1b[32m')

// Exports
module.exports = {
    hasFolderFormat,
    hasPortFormat,
    hasScriptFormat,
    getBinaryFile,
    getTextFile,
    logRed,
    logCyan,
    logGreen,
    replaceAll,
    unixifyPath
}
