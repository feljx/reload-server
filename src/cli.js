const { hasFolderFormat, hasPortFormat, hasScriptFormat } = require('./utils')
const { CuteServer } = require('./server')

const OPT_INPUT = '-i'
const OPT_SERVE = '-s'
const OPT_PORT = '-p'
const OPT_EFFECT = '-e'
const predicates = {
    [OPT_INPUT]: hasFolderFormat,
    [OPT_SERVE]: hasFolderFormat,
    [OPT_PORT]: hasPortFormat,
    [OPT_EFFECT]: hasScriptFormat
}
const labels = {
    [OPT_INPUT]: 'inputPath',
    [OPT_SERVE]: 'servedPath',
    [OPT_PORT]: 'port',
    [OPT_EFFECT]: 'effect'
}

function parseArguments (_args) {
    const [ , , ...args ] = _args
    const tuples = [ ...args ].reduce((acc, elm) => {
        const lastItem = acc[acc.length - 1]
        if (lastItem && lastItem.length < 2) {
            lastItem.push(elm)
        }
        else {
            acc.push([ elm ])
        }
        return acc
    }, [])
    const dict = tuples.reduce((acc, elm) => {
        const opt = elm[0]
        const arg = elm[1]
        const predicate = predicates[opt]
        if (predicate && predicate(arg)) {
            acc[labels[opt]] = arg
        }
        return acc
    }, {})
    return dict
}

const serverArgs = parseArguments(process.argv)

// EXECUTION
if (serverArgs.inputPath) {
    const server = CuteServer(serverArgs)
    server.start()
}

module.exports = { parseArguments }
