import chokidar from 'chokidar'
import { normalize } from 'path'

export function Watcher (path: string) {
    const watcher = chokidar.watch(path, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
    })
    const instance = Object.freeze({
        onUpdate (...callbacks: Function[]) {
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
