import { extname } from 'path'

interface Predicates {
    [key: string]: (arg0: string) => boolean
}
interface Labels {
    [key: string]: string
}
export interface Arguments {
    inputPath: string
    servedPath?: string
    _port?: string
    effect?: any
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
    [Option.Port]: '_port',
    [Option.Effect]: 'effect'
}

export function hasFolderFormat (str: string) {
    return !!str && extname(str) === ''
}

export function hasPortFormat (str: string) {
    const num = Number(str)
    return !isNaN(num) && num > 0 && num < 10000
}

export function hasScriptFormat (str: string) {
    return !!str && extname(str) === '.js'
}

// TODO: remove ts-ignores
export function parseArguments (_args: string[]) {
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
    // @ts-ignore
    const dictInitial: Arguments = {}
    const dict = tuples.reduce((acc, elm) => {
        const opt = elm[0]
        const arg = elm[1]
        const predicate = PREDICATES[opt]
        if (predicate && predicate(arg)) {
            const label = LABELS[opt]
            // @ts-ignore
            acc[label] = arg
        }
        return acc
    }, dictInitial)
    return dict
}
