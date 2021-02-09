const { test } = require('zora')
const { parseArguments } = require('../src/cli')

const OPT_INPUT = '-i'
const OPT_SERVE = '-s'
const OPT_PORT = '-p'
const OPT_EFFECT = '-e'

const input = [ 'node', 'script_name', '-i', 'src', '-p', '8000', '-s', 'out' ]
const expected = {
    [OPT_INPUT]: 'src',
    [OPT_SERVE]: 'out',
    [OPT_PORT]: '8000'
}

test('argument parsing', (t) => {
    const actual = parseArguments(input)
    t.deepEqual(actual, expected)
})
