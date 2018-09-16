const bcrypt = require('bcrypt')
const { query } = require('../../../../database/index.js')
const { sanitize, camelCaseMapKeys, decamelizeList, to } = require('@utils/index.js')
const decamelize = require('decamelize')

const READABLE_ACCOUNT_COLUMNS = [
  'email',
  'first_name',
  'last_name',
  'password_hash',
  'roles'
]

const EDITABLE_ACCOUNT_COLUMNS = [
  'email',
  'first_name',
  'last_name',
  'roles'
]

async function getAll({ selectFields = [], orderBy }) {
  let columns = ['account_id']

  if (selectFields[0] === '*') {
    columns = READABLE_ACCOUNT_COLUMNS
  } else {
    columns = columns.concat(decamelizeList(selectFields).filter(field => READABLE_ACCOUNT_COLUMNS.includes(field)))
  }

  let queryString = `SELECT ${columns.join(', ')} FROM Account`

  if (orderBy) {
    queryString += ' ORDER BY ' + Object.entries(orderBy).map(([column, direction]) => {
      return `${decamelize(column)} ${direction.toUpperCase()}`
    }).join(', ')
  }

  const [err, result] = await to(query(queryString))

  if (err) {
    return Promise.reject(err)
  }

  return result.rows.map(row => camelCaseMapKeys(row))
}

async function getWhere({ where, selectFields = [], orderBy }) {
  let columns = ['account_id']

  if (selectFields[0] === '*') {
    columns = READABLE_ACCOUNT_COLUMNS
  } else {
    columns = columns.concat(decamelizeList(selectFields).filter(field => READABLE_ACCOUNT_COLUMNS.includes(field)))
  }

  let queryString = `SELECT ${columns.join(', ')} FROM Account`

  let placeholderCounter = 1
  let conditions = Object.keys(where).map(columnName => {
    return `account.${decamelize(columnName)}=$${placeholderCounter++}`
  })

  queryString += ` WHERE ${conditions.filter(v => Boolean(v)).join(' AND ')}`

  if (orderBy) {
    queryString += ' ORDER BY ' + Object.entries(orderBy).map(([column, direction]) => {
      return `${decamelize(column)} ${direction.toUpperCase()}`
    }).join(', ')
  }

  const queryData = Object.values(where).filter(value => ['string', 'number', 'boolean'].indexOf(typeof value) >= 0)

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(err)
  }

  return result.rows.map(camelCaseMapKeys)
}

async function createAccount({ email, password, firstName, lastName, roles }) {
  const passwordHash = bcrypt.hashSync(password, 10)

  const queryString = 'INSERT INTO Account(email, first_name, last_name, roles, password_hash) VALUES($1, $2, $3, $4, $5) RETURNING *'
  const queryData = sanitize([email, firstName, lastName]).concat(roles, passwordHash)

  const [err, result] = await to(query(queryString, queryData))

  if (err) {
    return Promise.reject(err)
  }

  return result.rows.map(camelCaseMapKeys)
}

async function updateAccount({ accountId, updateMap }) {
  const set = []
  const queryData = [parseInt(accountId)]
  let placeholderCounter = queryData.length + 1

  Object.entries(updateMap).forEach(([key, value]) => {
    if (EDITABLE_ACCOUNT_COLUMNS.indexOf(decamelize(key)) === -1) {
      return
    }

    set.push(`${decamelize(key)}=$${placeholderCounter++}`)

    queryData.push(value);
  })

  const queryString = `UPDATE Account SET ${set.join(', ')} WHERE account_id=$1 RETURNING *`

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(err)
  }

  return result.rows.map(camelCaseMapKeys)
}

async function updateAccountPassword({ accountId, newPassword }) {
  const [err, passwordHash] = await to(bcrypt.hash(newPassword, 10))

  if (err) {
    return Promise.reject(err)
  }

  const queryString = `UPDATE Account SET password_hash=$2 WHERE account_id=$1 RETURNING *`
  const queryData = [parseInt(accountId), passwordHash]

  return query(queryString, queryData)
}

function deleteAccount({ accountId }) {
  const queryString = 'DELETE FROM Account WHERE account_id=$1 RETURNING *'
  const queryData = [parseInt(accountId)]

  return query(queryString, queryData)
}

module.exports.getAll = getAll
module.exports.getWhere = getWhere
module.exports.createAccount = createAccount
module.exports.updateAccount = updateAccount
module.exports.updateAccountPassword = updateAccountPassword
module.exports.deleteAccount = deleteAccount
