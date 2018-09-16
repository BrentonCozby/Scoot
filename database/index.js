const { Pool } = require('pg')
require('dotenv').config({ path: '../db.env' })

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
})

pool.on('error', function (err) {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

module.exports = {
	pool,
	query: (text, params) => pool.query(text, params)
}
