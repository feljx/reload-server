const http = require('http')
const url = require('url')
const fs = require('fs')

const dummy = fs.readFileSync(__dirname + '/index.html')

const LOCALHOST = 'localhost'
const PORT = 2000
const TEXT_HTML = 'text/html'

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function handleRequest (req, res) {
	const reqUrl = url.parse(req.url, true)
	const path = reqUrl.path

	const isRoot = path === '/'
	const isHtml = path.slice(-5) === '.html'
	const isHtm = path.slice(-4) === '.htm'

	console.log(path)

	res.writeHead(200, 'OK', { 'Content-Type': 'text/html' })
	res.write(dummy)
	res.end()
}

// Execute !
const server = http.createServer(handleRequest)
const addressAndPort = `${LOCALHOST}:${PORT}`
server.listen(PORT, LOCALHOST, () => void console.log(`Listening @ ${addressAndPort}`))
