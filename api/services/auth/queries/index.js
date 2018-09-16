const { query } = require('../../../../database/index.js')
const { sanitize, camelCaseMapKeys, to } = require('@utils/index.js')

async function getAccountByEmail({ email }) {
  const queryString = 'SELECT account_id, first_name, last_name, email, password_hash, roles FROM Account WHERE email=$1'
  const data = sanitize([email])

  const [err, result] = await to(query(queryString, data))

  if (err) {
    return Promise.reject(err)
  }

  return camelCaseMapKeys(result.rows[0])
}

module.exports.getAccountByEmail = getAccountByEmail
