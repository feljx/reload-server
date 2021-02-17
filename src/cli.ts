import { hasFolderFormat, hasPortFormat, hasScriptFormat } from './utils'
import CuteServer from './server'

interface Predicates {
    [key: string]: (arg0: string) => boolean
}
interface Labels {
    [key: string]: string
}
export interface Arguments {
    [key: string]: any
}

export enum Option {
    Input = '-i',
    Serve = '-s',
    Port = '-p',
    Effect = '-e'
}
const PREDICATES: Predicates = {
    [Option.Input]: hasFolderFormat,
    [Option.Serve]: hasFolderFormat,
    [Option.Port]: hasPortFormat,
    [Option.Effect]: hasScriptFormat
}
const LABELS: Labels = {
    [Option.Input]: 'inputPath',
    [Option.Serve]: 'servedPath',
    [Option.Port]: 'port',
    [Option.Effect]: 'effect'
}

// Execution starts here
try {
    const serverArgs = parseArguments(process.argv)
    if (serverArgs.inputPath) {
        const server = CuteServer(serverArgs)
        server.start()
    }
    else {
        throw new Error('No input path given')
    }
} catch (error) {
    console.log(error)
}

function parseArguments (_args: string[]) {
    const [ , , ...args ] = _args
    const tuplesInitial: string[][] = []
    const tuples = [ ...args ].reduce((acc, elm) => {
        const lastItem = acc[acc.length - 1]
        if (lastItem && lastItem.length < 2) {
            lastItem.push(elm)
        }
        else {
            acc.push([ elm ])
        }
        return acc
    }, tuplesInitial)
    const dictInitial: Arguments = {}
    const dict = tuples.reduce((acc, elm) => {
        const opt = elm[0]
        const arg = elm[1]
        const predicate = PREDICATES[opt]
        if (predicate && predicate(arg)) {
            const label = LABELS[opt]
            acc[label] = arg
        }
        return acc
    }, dictInitial)
    return dict
}
