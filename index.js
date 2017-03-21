const http = require('http')
const app = require('./src/app')
require('http-shutdown').extend()

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const args = require('yargs').argv
const server = http.createServer(app).withShutdown()

server.listen(args.port || 3000)

process.on('SIGTERM', () => {
  console.log('Stopping proxy server')
  server.shutdown(() => {
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Stopping proxy server')
  server.shutdown(() => {
    process.exit(0)
  })
})

process.once('SIGUSR2', () => {
  server.shutdown(() => {
    process.kill(process.pid, 'SIGUSR2')
  })
})
