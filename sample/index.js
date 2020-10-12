const url = 'ws://localhost:2001'
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
