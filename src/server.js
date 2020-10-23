const { resolve, extname } = require('path')
const http = require('http')
const { Server } = require('ws')
const { getTextFile, getBinaryFile, log_in_cyan, log_in_red } = require('./utils')
const { CONTENT_TYPES, ARROWL, ARROWR, LOCALHOST } = require('./constants')

function DevServer (dir, port) {
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
			log_in_red(`${ARROWL} Sent 406 due requested file lacking extension`)
			return
		}

		const url_parts = req.url.split('/').filter((part) => !!part)
		const filepath = dir_root_requested
			? resolve(dir, ...url_parts, 'index.html')
			: resolve(dir, ...url_parts)
		const mime = CONTENT_TYPES[requested_file_ext]
		const has_mime = typeof mime === 'string'

		if (has_mime) {
			try {
				// 200 for OK requests
				const fileReaderFn = mime.includes('text') ? getTextFile : getBinaryFile
				const data = await fileReaderFn(filepath)
				// console.log(`=> HTTP ${req.method} - ${mime}: ${requested}`)
				res.writeHead(200, 'OK', { 'Content-Type': mime })
				res.write(data)
				res.end()
				return
			} catch (error) {
				// 404 if file system access fails
				log_in_red(
					error.code === 'ENOENT'
						? `${ARROWR} No such file or directory: ${filepath}`
						: error
				)
				res.writeHead(404, 'Not Found')
				res.end()
				log_in_red(`${ARROWL} Sent 404 due to file system error`)
				return
			}
		}
		else {
			// 406 for files with unhandled MIME type
			res.writeHead(406, 'Not Acceptable')
			res.end()
			log_in_red(`${ARROWL} Sent 406 due to unhandlded MIME type`)
			return
		}
	}

	try {
		const server = http.createServer(handle_http_request)
		const socket_server = new Server({ port: port + 1 })
		let socket_connection = null
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
					log_in_red(
						`${ARROWR} Dev server couldn't be started due to the following error:`,
						error
					)
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
