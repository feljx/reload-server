# cute-dev-server
Static HTTP server with live reloading for developing simple web projects

### Installation
`npm i -D cute-dev-server`

### Usage
`npx cute <directory> <port>`

or create an npm script like so

`"script-name": "cute <directory> <port>"`

Defaults (if not specified)
- directory: `.` (current directory)
- port: `2000`

#### Custom Script Callback

Execute a custom node script on file change

`npx cute <directory> <port> <node_script>`
