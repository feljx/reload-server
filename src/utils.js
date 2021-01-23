const { readFile, writeFile } = require('fs')

/**
 * Get binary file
 * @param {string} path
 * @returns {Promise}
 */

const get_binary_file = (path) =>
	new Promise((resolve, reject) => {
		readFile(path, { encoding: null, flag: 'r' }, (err, data) => {
			if (err) reject(err)
			if (data) resolve(data)
		})
	})

/**
 * Get text file
 * @param {string} path
 * @returns {Promise}
 */

const get_text_file = (path) =>
	new Promise((resolve, reject) => {
		readFile(path, { encoding: 'utf8', flag: 'r' }, (err, data) => {
			if (err) reject(err)
			if (data) resolve(data)
		})
	})

/**
 * Inject websocket script into index.html data *
 * @param {string} data
 */

const inject_socket_script = (data) => {
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
 * Write socket script into served directory
 * @param {*} path
 */

const get_socket_script = (port) => `const url = 'ws://localhost:${port}'
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

/**
 * Higher-order function to create colorful loggers
 * @param {string} color
 * @returns {(...msgs: any[]) => void}
 */

const log_in_color = (color) => (...msgs) => console.log(color, ...msgs, '\x1b[0m')

const log_in_red = log_in_color('\x1b[31m')
const log_in_cyan = log_in_color('\x1b[36m')
const log_in_green = log_in_color('\x1b[32m')

module.exports = {
	get_binary_file,
	get_text_file,
	inject_socket_script,
	get_socket_script,
	log_in_red,
	log_in_cyan,
	log_in_green
}
