const fs = require('fs')
const path = require('path')
const http = require('http')
const { CONTENT_TYPES, LOCALHOST } = require('./constants')

class HTTPServer {
	constructor (port) {
		try {
			const server = http.createServer(handleRequest)
			server.listen(port, LOCALHOST)
			console.log(`-------> Dev server listening @ localhost:${port}`)
		} catch (error) {
			console.log(error)
		}
	}
}

/**
 * HTTP Request Handler
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @returns {Promise}
 */

async function handleRequest (req, res) {
	const _requested = req.url === '/' ? '/index.html' : req.url
	const requested = _requested[0] === '/' ? _requested.slice(1) : _requested
	const _extension = requested.split('.')
	const hasExtension = _extension.length > 1
	const extension = hasExtension && _extension[_extension.length - 1]
	const mime = CONTENT_TYPES[extension]
	const hasMime = typeof mime === 'string'

	// TODO: Make wrong filenames always return a 404 (example: requested path ends in "/")

	try {
		if (hasExtension && hasMime) {
			const filepath = path.resolve(process.cwd(), requested)
			const fileReaderFn = mime.includes('text') ? getTextFile : getBinaryFile
			const data = await fileReaderFn(filepath)
			// console.log(`=> HTTP ${req.method} - ${mime}: ${requested}`)
			res.writeHead(200, 'OK', { 'Content-Type': mime })
			res.write(data)
			res.end()
			return
		}
		else {
			res.writeHead(406, 'Not Acceptable')
			res.end()
		}
	} catch (error) {
		console.log(error)
		res.writeHead(404, 'Not Found')
		res.end()
	}
}

module.exports = HTTPServer
