#!/usr/bin/env node

const chokidar = require('chokidar')
const { DEFAULT_DIR, DEFAULT_PORT, ARROWR } = require('./constants')
const DevServer = require('./server')
const { log_in_red } = require('./utils')

// Args
const [ , , _dir, _port ] = process.argv
const dir = _dir || DEFAULT_DIR
const port = Number(_port) || DEFAULT_PORT

try {
	// Create server
	const server = DevServer(dir, port)
	server.start()

	const watcher = chokidar.watch(dir, {
		ignored: /(^|[\/\\])\../, // ignore dotfiles
		persistent: true
	})

	const changeEvents = [ 'add', 'change', 'unlink', 'addDir', 'unlinkDir' ]

	// on change
	for (const eventType of changeEvents) {
		// execute optional side effect
		//
		// reload server
		watcher.on(eventType, () => server.reload())
	}
} catch (error) {
	log_in_red(`${ARROWR} Couldn't initialize dev server:`, error)
}
