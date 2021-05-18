#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var fs = require('fs');
var express = require('express');
var mime = require('mime');
var ws = require('ws');
var chokidar = require('chokidar');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var mime__default = /*#__PURE__*/_interopDefaultLegacy(mime);
var chokidar__default = /*#__PURE__*/_interopDefaultLegacy(chokidar);

function replaceAll(a, b, s) {
    while (s.includes(a)) {
        s = s.replace(a, b);
    }
    return s;
}
function unixifyPath(path) {
    const double_back = '\\\\';
    const single_back = '\\';
    const forward = '/';
    return replaceAll(single_back, forward, replaceAll(double_back, forward, path));
}
function hasFolderFormat(str) {
    return !!str && path.extname(str) === '';
}
function hasPortFormat(str) {
    const num = Number(str);
    return !isNaN(num) && num > 0 && num < 10000;
}
function hasScriptFormat(str) {
    return !!str && path.extname(str) === '.js';
}
/**
 * Get binary file
 * @param {string} path
 * @returns {Promise}
 */
function getBinaryFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, { encoding: null, flag: 'r' }, (err, data) => {
            if (err)
                reject(err);
            if (data)
                resolve(data);
        });
    });
}
/**
 * Get text file
 * @param {string} path
 * @returns {Promise}
 */
function getTextFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, { encoding: 'utf8', flag: 'r' }, (err, data) => {
            if (err)
                reject(err);
            if (data)
                resolve(data);
        });
    });
}
const SOCKET_SCRIPT_NAME = '_websocket.js';
/**
 * Inject websocket script into index.html data *
 * @param {string} data
 */
function injectSocketScript(data) {
    const regex = /([^]+)(<body>\n?)(\s*)([^]+)(<\/body>)([^]+)/;
    const [_, rest_start, body_tag_open, indent, rest_mid, body_tag_close, rest_end] = data.match(regex) || [];
    const script_tag = `<script src="${SOCKET_SCRIPT_NAME}"></script>\n`;
    return (rest_start +
        body_tag_open +
        indent +
        rest_mid +
        indent +
        script_tag +
        body_tag_close +
        rest_end);
}
/**
 * Get WebSocket script to serve
 * @param {number | string} port
 */
function getSocketScript(port) {
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
`;
}

function Watcher(path) {
    const watcher = chokidar__default['default'].watch(path, {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });
    const instance = Object.freeze({
        onUpdate(...callbacks) {
            const watchEvents = ['add', 'change', 'unlink'];
            watchEvents.forEach((eventName) => {
                watcher.on(eventName, (filepath) => {
                    for (const fn of callbacks) {
                        fn(filepath);
                    }
                });
            });
        },
        close() {
            watcher.close();
        }
    });
    return instance;
}

const DEFAULT_PORT = 8000;
function getMime(filepath) {
    return mime__default['default'].getType(filepath);
}
function isTextFile(filepath) {
    const m = mime__default['default'].getType(filepath);
    return (m.slice(0, 4) === 'text' || m === mime__default['default'].getType('js') || m === mime__default['default'].getType('mjs'));
}
function CachePath(filepath) {
    const unixPath = unixifyPath(filepath);
    const regex = /\w+(\/.*)?$/;
    const match = regex.exec(unixPath);
    const cachePath = (match && match[1]) || '/';
    return cachePath[cachePath.length - 1] === '/' ? cachePath + 'index.html' : cachePath;
}
function CuteServer({ inputPath, servedPath, _port, effect }) {
    try {
        // normalize port argument
        const port = Number(_port) || DEFAULT_PORT;
        const websocketPort = port + 1;
        // initialize file data cache
        const cache = {};
        cache[`/${SOCKET_SCRIPT_NAME}`] = getSocketScript(websocketPort);
        // initialize app
        const app = express__default['default']();
        // create Watcher object (wraps chokidar)
        const watcher = Watcher(inputPath);
        // cache files callback
        const cacheFiles = (filepath) => {
            const fileReaderFn = isTextFile(filepath) ? getTextFile : getBinaryFile;
            const cachePath = CachePath(filepath);
            const isIndexHtml = cachePath.includes('index.html');
            const cacheData = (isIndexHtml) => (data) => void (cache[cachePath] = isIndexHtml
                ? injectSocketScript(data)
                : data);
            fileReaderFn(filepath).then(cacheData(isIndexHtml)).catch((error) => {
                throw new Error(`ERROR reading data from server: ${error}`);
            });
        };
        // reload client thru websocket
        const reloadClient = () => {
            if (socket) {
                socket.send('reload');
            }
        };
        // on file change, cache files and reload client
        const cacheFilesAndReload = (path) => {
            cacheFiles(path);
            reloadClient();
        };
        watcher.onUpdate(cacheFilesAndReload);
        // HTTP and WebSocket servers instances
        let nodeHttpServer;
        let websocketServer;
        let socket;
        // CuteServer instance
        const instance = Object.freeze({
            start() {
                // routing
                app.get('/*', (req, res) => {
                    const requestedPath = req.url[req.url.length - 1] === '/'
                        ? req.url + 'index.html'
                        : req.url;
                    const data = cache[requestedPath];
                    // console.log(`REQUEST ${req.url} MAPPED TO ${requestedPath}`)
                    res.set('Content-Type', getMime(requestedPath));
                    res.send(data);
                });
                // initialize HTTP server
                nodeHttpServer = app.listen(port, () => {
                    console.log(`Listening at http://localhost:${port}`);
                });
                // initialize WebSocket server
                websocketServer = new ws.Server({ port: websocketPort });
                websocketServer.on('connection', (ws) => {
                    socket = ws;
                });
                websocketServer.on('close', () => {
                    socket = null;
                });
            },
            //
            stop() {
                if (nodeHttpServer)
                    nodeHttpServer.close();
            }
        });
        // return CuteServer instance
        return instance;
    }
    catch (error) {
        throw new Error(`ERROR thrown in CuteServer instance code: ${error}`);
    }
}

exports.Option = void 0;
(function (Option) {
    Option["Input"] = "-i";
    Option["Serve"] = "-s";
    Option["Port"] = "-p";
    Option["Effect"] = "-e";
})(exports.Option || (exports.Option = {}));
const PREDICATES = {
    [exports.Option.Input]: hasFolderFormat,
    [exports.Option.Serve]: hasFolderFormat,
    [exports.Option.Port]: hasPortFormat,
    [exports.Option.Effect]: hasScriptFormat
};
const LABELS = {
    [exports.Option.Input]: 'inputPath',
    [exports.Option.Serve]: 'servedPath',
    [exports.Option.Port]: 'port',
    [exports.Option.Effect]: 'effect'
};
// Execution starts here
try {
    const serverArgs = parseArguments(process.argv);
    if (serverArgs.inputPath) {
        const server = CuteServer(serverArgs);
        server.start();
    }
    else {
        throw new Error('No input path given');
    }
}
catch (error) {
    console.log(error);
}
function parseArguments(_args) {
    const [, , ...args] = _args;
    const tuplesInitial = [];
    const tuples = [...args].reduce((acc, elm) => {
        const lastItem = acc[acc.length - 1];
        if (lastItem && lastItem.length < 2) {
            lastItem.push(elm);
        }
        else {
            acc.push([elm]);
        }
        return acc;
    }, tuplesInitial);
    const dictInitial = {};
    const dict = tuples.reduce((acc, elm) => {
        const opt = elm[0];
        const arg = elm[1];
        const predicate = PREDICATES[opt];
        if (predicate && predicate(arg)) {
            const label = LABELS[opt];
            acc[label] = arg;
        }
        return acc;
    }, dictInitial);
    return dict;
}
