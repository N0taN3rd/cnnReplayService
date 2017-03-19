const http = require('http')
const express = require('express')
const expressProx = require('express-http-proxy')
const url = require('url')
const removeWdd = require('./removeWdd')
require('http-shutdown').extend()

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const app = express()
const server = http.createServer(app).withShutdown()
const main = 'http://web.archive.org'

const shouldRemove = /^\/web\/[0-9]{14}\/https?:\/\/(?:www\.)?cnn\.com\/?$/
const replayRe = /^\/web\/[0-9]{14}(?:[a-z]{2}_)?\/.+/
const shouldCorrectPath = /^\/data\/ocs\/section\/.+$/

let replaying = null
app.use('/', expressProx(main, {
  memoizeHost: false,
  forwardPath(req, res) {
    if (req.url === '/') {
      replaying = null
      return '/web/*/http://www.cnn.com/'
    }
    if (shouldCorrectPath.test(req.url) && replaying) {
      return url.parse(`${replaying}${req.url.substring(1)}`).path
    }
    return url.parse(req.url).path
  },
  decorateRequest (proxyReq, originalReq) {
    proxyReq.headers['Host'] = 'web.archive.org'
    if (replayRe.test(proxyReq.path) && replaying) {
      proxyReq.headers['Referer'] = replaying
    } else {
      proxyReq.headers['Referer'] = 'http://web.archive.org/web/*/http://www.cnn.com/'
    }
    return proxyReq
  },
  intercept (rsp, data, req, res, cb) {
    if (shouldRemove.test(req.url)) {
      replaying = `http://web.archive.org${req.url}`
      cb(null, removeWdd(data.toString('utf8')))
    } else {
      cb(null, data)
    }
  }
}))

server.listen(3000)

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