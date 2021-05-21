# reload-server
Static HTTP server with live reloading for developing simple web projects

### Installation
`npm i -D reload-server`

### Usage
`npx reload-server -i <inputFolder> -p <port>`
Input folder is required, port is optional.

or create an npm script like so

`"script-name": "reload-server -i <inputFolder> -p <port>`

Defaults (if not specified)
- port: `8000`
