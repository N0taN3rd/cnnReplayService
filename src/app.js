const express = require('express')
const expressProx = require('express-http-proxy')
const cors = require('cors')
const url = require('url')
const removeWdd = require('./removeWdd')

const root = '/', defaultPath = '/web/*/http://www.cnn.com/'
const app = express()
const main = 'http://web.archive.org'

const shouldRemove = /^\/web\/[0-9]{14}\/https?:\/\/(?:www\.)?cnn\.com\/?$/
const replayRe = /^\/web\/[0-9]{14}(?:[a-z]{2}_)?\/.+/
const shouldCorrectPath = /^\/data\/ocs\/section\/.+$/
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 200
}

let replaying = null, replayPath = null

app.enable('trust proxy')
app.disable('x-powered-by')
// because Im proxying just ok everything and let IA sort it out :)
app.options('*', cors(corsOptions))

app.use(root, expressProx(main, {
  forwardPath(req, res) {
    let thePath
    if (req.url === root) {
      replaying = null
      thePath = defaultPath
    } else if (shouldCorrectPath.test(req.url) && replaying) {
      // correct the url for the new dynamic content
      thePath = `${replayPath}${req.url.substring(1)}`
    } else {
      thePath = url.parse(req.url).path
    }
    return thePath
  },
  decorateRequest (proxyReq, originalReq) {
    if (proxyReq.headers.origin) {
      // sometimes the request headers have the proxy origin dont want that leaking
      // this reduces the number of ECONNREFUSED (IA refuses our connection)
      delete proxyReq.headers.origin
    }
    proxyReq.headers.host = 'web.archive.org'
    if (replayRe.test(proxyReq.path) && replaying) {
      proxyReq.headers.referer = replaying
    } else if (proxyReq.path === defaultPath) {
      proxyReq.headers.referer = 'http://archive.org/web/'
    } else {
      proxyReq.headers.referer = 'http://web.archive.org/web/*/http://www.cnn.com/'
    }
    return proxyReq
  },
  intercept (rsp, data, req, res, cb) {
    if (shouldRemove.test(req.url)) {
      replaying = `http://web.archive.org${req.url}`
      replayPath = url.parse(replaying).path
      cb(null, removeWdd(data.toString('utf8')))
    } else {
      cb(null, data)
    }
  }
}))

module.exports = app
