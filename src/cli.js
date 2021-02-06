#!/usr/bin/env node

const { execFile, execFileSync } = require('child_process')
const chokidar = require('chokidar')
const { DEFAULT_DIR, DEFAULT_PORT, ARROWR } = require('./constants')
const DevServer = require('./server')
const { log_in_red } = require('./utils')

// Args
const [ , , _dir, _port, watch_callback_script ] = process.argv
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

	let side_effect_in_progress = false
	// for all change events
	for (const eventType of changeEvents) {
		// on change
		watcher.on(eventType, () => {
			// execute optional side effect
			if (watch_callback_script) {
				if (!side_effect_in_progress) {
					side_effect_in_progress = true

					execFile('node', [ watch_callback_script ], (error) => {
						side_effect_in_progress = false
						if (error) {
							console.error(error)
						}
					})
				}
			}
			// reload server
			server.reload()
		})
	}
} catch (error) {
	log_in_red(`${ARROWR} Couldn't initialize dev server:`, error)
}
