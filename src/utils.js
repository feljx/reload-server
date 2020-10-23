const { readFile } = require('fs')

/**
 * Get binary file
 * @param {string} path
 * @returns {Promise}
 */

const getBinaryFile = (path) =>
	new Promise((resolve, reject) => {
		readFile(path, { encoding: null, flag: 'r' }, (err, data) => {
			if (err) reject(err)
			if (data) resolve(data)
		})
	})

/**
 * Get text file
 * @param {string} path
 * @returns {Promise}
 */

const getTextFile = (path) =>
	new Promise((resolve, reject) => {
		readFile(path, { encoding: 'utf8', flag: 'r' }, (err, data) => {
			if (err) reject(err)
			if (data) resolve(data)
		})
	})

/**
 * Higher-order function to create colorful loggers
 * @param {string} color
 * @returns {(...msgs: any[]) => void}
 */

const log_in_color = (color) => (...msgs) => console.log(color, ...msgs, '\x1b[0m')

const log_in_red = log_in_color('\x1b[31m')
const log_in_cyan = log_in_color('\x1b[36m')
const log_in_green = log_in_color('\x1b[32m')

module.exports = { getBinaryFile, getTextFile, log_in_red, log_in_cyan, log_in_green }
