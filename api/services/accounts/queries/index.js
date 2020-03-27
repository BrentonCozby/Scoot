const bcrypt = require('bcrypt')
const { query } = require('../../../../database/index.js')
const { sanitize, camelCaseMapKeys, decamelizeList, to } = require('@utils/index.js')
const decamelize = require('decamelize')

const READABLE_ACCOUNT_FIELDS = [
  'account_id',
  'email',
  'first_name',
  'last_name',
  'password_hash',
  'roles'
]

const EDITABLE_ACCOUNT_FIELDS = [
  'email',
  'first_name',
  'last_name',
  'roles'
]

const dataTypeMap = {
  accountId: 'number',
  email: 'string',
  firstName: 'string',
  lastName: 'string',
  roles: 'string'
}

async function get({
  selectFields = [],
  where,
  orderBy
}) {
  let fields = ['account_id']

  if (selectFields[0] === '*' || selectFields.length === 0) {
    fields = [READABLE_ACCOUNT_FIELDS]
  } else {
    fields = [...new Set(fields.concat(decamelizeList(selectFields).filter(field => READABLE_ACCOUNT_FIELDS.includes(field))))]
  }

  let queryString = `SELECT ${fields.join(', ')} FROM Account`

  let placeholderCounter = 1
  let conditions = []
  Object.entries(where || {}).forEach(([field, value]) => {
    if (['string', 'number', 'boolean'].indexOf(typeof value) === -1) {
      return
    }

    const operator = dataTypeMap[field] === 'string' ? 'ILIKE' : '='

    if (READABLE_ACCOUNT_FIELDS.includes(decamelize(field))) {
      conditions.push(`account.${decamelize(field)} ${operator} $${placeholderCounter++}`)
    }
  })

  if (conditions.length) {
    queryString += ` WHERE ${conditions.filter(v => Boolean(v)).join(' AND ')}`
  }

  if (orderBy) {
    queryString += ' ORDER BY ' + Object.entries(orderBy).map(([field, direction]) => {
      return `${decamelize(field)} ${direction.toUpperCase()}`
    }).join(', ')
  }

  const queryData = Object.values(where || {}).filter(value => ['string', 'number', 'boolean'].indexOf(typeof value) >= 0)

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(new Error(`\nnode-postgres ${err.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

async function create({
  email,
  password,
  firstName,
  lastName,
  roles
}) {
  const passwordHash = bcrypt.hashSync(password, 10)

  const queryString = 'INSERT INTO Account(email, first_name, last_name, roles, password_hash) VALUES($1, $2, $3, $4, $5) RETURNING *'
  const queryData = sanitize([email, firstName, lastName]).concat(roles, passwordHash)

  const [err, result] = await to(query(queryString, queryData))

  if (err) {
    return Promise.reject(new Error(`\nnode-postgres ${err.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

async function update({
  accountId,
  updateMap
}) {
  const set = []
  const queryData = [parseInt(accountId)]
  let placeholderCounter = queryData.length + 1

  Object.entries(updateMap).forEach(([field, value]) => {
    if (EDITABLE_ACCOUNT_FIELDS.indexOf(decamelize(field)) === -1) {
      return
    }

    set.push(`${decamelize(field)}=$${placeholderCounter++}`)

    queryData.push(value);
  })

  const queryString = `UPDATE Account SET ${set.join(', ')} WHERE account_id=$1 RETURNING *`

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(new Error(`\nnode-postgres ${err.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

async function updatePassword({
  accountId,
  newPassword
}) {
  const [hashErr, passwordHash] = await to(bcrypt.hash(newPassword, 10))

  if (hashErr) {
    return Promise.reject(new Error(`\nnode-postgres ${hashErr.toString()}`))
  }

  const queryString = `UPDATE Account SET password_hash=$2 WHERE account_id=$1 RETURNING *`
  const queryData = [parseInt(accountId), passwordHash]

  const [queryErr, result] = await to(query(queryString, sanitize(queryData)))

  if (queryErr) {
    return Promise.reject(new Error(`\nnode-postgres ${queryErr.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

async function remove({ accountId }) {
  const queryString = 'DELETE FROM Account WHERE account_id=$1 RETURNING *'
  const queryData = [parseInt(accountId)]

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(new Error(`\nnode-postgres ${err.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

module.exports.get = get
module.exports.create = create
module.exports.update = update
module.exports.updatePassword = updatePassword
module.exports.remove = remove
