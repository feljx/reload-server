const { resolve, extname } = require('path')
const http = require('http')
const { Server } = require('ws')
const {
	get_text_file,
	get_binary_file,
	log_in_cyan,
	log_in_red,
	inject_socket_script,
	get_socket_script
} = require('./utils')
const { CONTENT_TYPES, ARROWL, ARROWR, LOCALHOST } = require('./constants')

function DevServer (dir, port) {
	if (typeof dir !== 'string') throw new Error('No directory to serve given.')
	if (typeof port !== 'number') throw new Error('No port given.')
	if (port <= 0) throw new Error('Wrong port given.')

	const socket_port = port + 1

	const handle_http_request = async (req, res) => {
		const last_char_in_requested_url = req.url[req.url.length - 1]
		const dir_root_requested = last_char_in_requested_url === '/'
		// if (dir_root_requested) req.url + 'index.html'
		const requested_file_ext = dir_root_requested ? 'html' : extname(req.url).slice(1)
		const file_without_ext_requested =
			!dir_root_requested && requested_file_ext === ''

		if (file_without_ext_requested) {
			// 406 for files without extension
			res.writeHead(406, 'Not Acceptable')
			res.end()
			log_in_red(`${ARROWL} 406: file  has no file extension`)
			return
		}

		const url_parts = req.url.split('/').filter((part) => !!part)
		const filepath = dir_root_requested
			? resolve(dir, ...url_parts, 'index.html')
			: resolve(dir, ...url_parts)
		const fileslug = req.url.match(/(?:.*\/)(.*)/)[1]
		const mime = CONTENT_TYPES[requested_file_ext]
		const has_mime = typeof mime === 'string'
		const is_index_html = dir_root_requested || fileslug === 'index.html'
		const is_socket_script = !is_index_html && fileslug === '_websocket.js'

		if (has_mime) {
			try {
				const fileReaderFn = mime.includes('text')
					? get_text_file
					: get_binary_file
				const data = is_index_html
					? inject_socket_script(await fileReaderFn(filepath))
					: is_socket_script
						? get_socket_script(socket_port)
						: await fileReaderFn(filepath)
				// 200 for OK requests
				res.writeHead(200, 'OK', { 'Content-Type': mime })
				res.write(data)
				res.end()
				return
			} catch (error) {
				log_in_red(
					error.code === 'ENOENT'
						? `${ARROWL} 404: No such file or directory: ${filepath}`
						: error
				)
				// 404 if file system access fails
				res.writeHead(404, 'Not Found')
				res.end()
				return
			}
		}
		else {
			// 406 for files with unhandled MIME type
			res.writeHead(406, 'Not Acceptable')
			res.end()
			log_in_red(`${ARROWL} 406: unhandlded MIME type`)
			return
		}
	}

	try {
		const server = http.createServer(handle_http_request)
		const socket_server = new Server({ port: socket_port })
		let socket_connection = null

		// DevServer API object
		return Object.freeze({
			start () {
				try {
					server.listen(port, LOCALHOST)
					socket_server.on('connection', (ws) => {
						socket_connection = ws
					})
					socket_server.on('close', () => {
						socket_connection = null
					})
					log_in_cyan(`${ARROWR} Dev server listening @ localhost:${port}`)
				} catch (error) {
					log_in_red(`${ARROWR} Dev server couldn't be started:`, error)
				}
			},
			reload () {
				if (socket_connection) {
					socket_connection.send('reload')
				}
			},
			stop () {
				server.close((err) => {
					if (err) log_in_red(`${ARROWR} Dev server couldn't be closed.`)
					else log_in_cyan(`${ARROWR} Dev server closed.`)
				})
			}
		})
	} catch (error) {
		log_in_red(`${ARROWR} Dev server couldn't be created:`, error)
	}
}

module.exports = DevServer
