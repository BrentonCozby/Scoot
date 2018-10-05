const express = require('express')
const bodyParser = require('body-parser')
const router = require('./router.js')
const errorHandlers = require('./errors/index')
const app = express()

app.use(require('express-pino-logger')())

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['http://localhost:3000'])
    res.append('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
    res.append('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', router)

app.use(errorHandlers.notFound)
app.use(errorHandlers.production)

module.exports = app
