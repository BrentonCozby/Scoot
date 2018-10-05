const { resolve } = require('path')
const moduleAlias = require('module-alias')

moduleAlias.addAliases({
  '@root': __dirname,
  '@services': resolve(__dirname, 'services'),
  '@utils': resolve(__dirname, 'utils')
})

const app = require('./app')
const { pool } = require('../database/index.js')

require('dotenv').config({ path: '../api.env' })

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
