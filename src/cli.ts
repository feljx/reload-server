import LiveReloadServer from './server'
import { parseArguments } from './args'

// Defaults
const DEFAULT_PORT = '8000'

// Execution starts here
try {
    const serverArgs = parseArguments(process.argv)
    if (!serverArgs._port) {
        serverArgs._port = DEFAULT_PORT
    }
    if (serverArgs.inputPath) {
        const server = LiveReloadServer(serverArgs)
        server.start()
    }
    else {
        throw new Error('No input path given')
    }
} catch (error) {
    console.log(error)
}
