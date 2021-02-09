const chokidar = require('chokidar')
const { normalize } = require('path')

function Watcher (path) {
    const watcher = chokidar.watch(path, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
    })
    const instance = Object.freeze({
        onUpdate (...callbacks) {
            const watchEvents = [ 'add', 'change', 'unlink' ]
            watchEvents.forEach((eventName) => {
                watcher.on(eventName, (filepath) => {
                    for (const fn of callbacks) {
                        fn(filepath)
                    }
                })
            })
        },
        close () {
            watcher.close()
        }
    })
    return instance
}

module.exports = { Watcher }
