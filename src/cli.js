#!/usr/bin/env node

const chokidar = require('chokidar')
const { DEFAULT_DIR, DEFAULT_PORT, ARROWR } = require('./constants')
const DevServer = require('./server')

// Args
const [ , , dir = DEFAULT_DIR, port = DEFAULT_PORT ] = process.argv

try {
	// Create server
	const server = DevServer(dir, port)
	server.start()

	const watcher = chokidar.watch(dir, {
		ignored: /(^|[\/\\])\../, // ignore dotfiles
		persistent: true
	})

	const changeEvents = [ 'add', 'change', 'unlink', 'addDir', 'unlinkDir' ]

	for (const eventType of changeEvents) {
		watcher.on(eventType, () => server.reload())
	}
} catch (error) {
	console.error(`${ARROWR} Couldn't initialize dev server`)
}
