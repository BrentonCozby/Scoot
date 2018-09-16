const { resolve } = require('path')
const moduleAlias = require('module-alias')

moduleAlias.addAliases({
  '@root': __dirname,
  '@services': resolve(__dirname, 'services'),
  '@utils': resolve(__dirname, 'utils')
})

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const router = require('./router.js')
const { pool } = require('../database/index.js')
const { passport } = require('./passport.js')

require('dotenv').config({ path: 'api.env' })
app.use(require('morgan')('dev'))

app.use(passport.initialize())

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['http://localhost:3000'])
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.append('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', router)

app.set('port', process.env.PORT)

const server = app.listen(app.get('port'), () => {
  console.log(`Scoot API running → PORT ${app.get('port')}`)
})

server.on('close', () => {
	console.log('Closed express server')

	pool.end(() => {
		console.log('Shut down database connection pool')
	})
})
