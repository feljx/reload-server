import test from 'ava'
import { parseArguments } from '../src/args.js'

const OPT_INPUT = '-i'
const OPT_SERVE = '-s'
const OPT_PORT = '-p'
const OPT_EFFECT = '-e'

const input_1 = [ 'node', 'script_name', '-i', 'src', '-p', '2000', '-s', 'out' ]
const input_2 = [ 'node', 'script_name' ]

const expected_1 = {
    inputPath: 'src',
    servedPath: 'out',
    _port: '2000'
}

const expected_2 = {}

test('argument parsing 1', (t) => {
    const actual = parseArguments(input_1)
    t.deepEqual(actual, expected_1)
})

test('argument parsing 2', (t) => {
    const actual = parseArguments(input_2)
    t.deepEqual(actual, expected_2)
})
