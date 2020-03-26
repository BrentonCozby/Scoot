const bcrypt = require('bcrypt')
const { query } = require('../../../../database/index.js')
const { sanitize, camelCaseMapKeys, decamelizeList, to } = require('@utils/index.js')
const decamelize = require('decamelize')

const READABLE_ACCOUNT_FIELDS = [
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
  let columns = ['account_id']

  if (selectFields[0] === '*' || selectFields.length === 0) {
    columns = READABLE_ACCOUNT_FIELDS
  } else {
    columns = columns.concat(decamelizeList(selectFields).filter(field => READABLE_ACCOUNT_FIELDS.includes(field)))
  }

  let queryString = `SELECT ${columns.join(', ')} FROM Account`

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
    queryString += ' ORDER BY ' + Object.entries(orderBy).map(([column, direction]) => {
      return `${decamelize(column)} ${direction.toUpperCase()}`
    }).join(', ')
  }

  const queryData = Object.values(where || {}).filter(value => ['string', 'number', 'boolean'].indexOf(typeof value) >= 0)

  console.log(queryString)
  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(err)
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
    return Promise.reject(err)
  }

  return result.rows.map(camelCaseMapKeys)
}

async function update({
  accountId,
  email,
  firstName,
  lastName,
  roles
}) {
  const set = []
  const queryData = [parseInt(accountId)]
  const fieldsMap = {email, firstName, lastName, roles}
  let placeholderCounter = queryData.length + 1

  Object.entries(fieldsMap).forEach(([field, value]) => {
    if (EDITABLE_ACCOUNT_FIELDS.indexOf(decamelize(field)) === -1) {
      return
    }

    set.push(`${decamelize(field)}=$${placeholderCounter++}`)

    queryData.push(value);
  })

  const queryString = `UPDATE Account SET ${set.join(', ')} WHERE account_id=$1 RETURNING *`

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(err)
  }

  return result.rows.map(camelCaseMapKeys)
}

async function updatePassword({
  accountId,
  newPassword
}) {
  const [err, passwordHash] = await to(bcrypt.hash(newPassword, 10))

  if (err) {
    return Promise.reject(err)
  }

  const queryString = `UPDATE Account SET password_hash=$2 WHERE account_id=$1 RETURNING *`
  const queryData = [parseInt(accountId), passwordHash]

  return query(queryString, queryData)
}

function remove({ accountId }) {
  const queryString = 'DELETE FROM Account WHERE account_id=$1 RETURNING *'
  const queryData = [parseInt(accountId)]

  return query(queryString, queryData)
}

module.exports.get = get
module.exports.create = create
module.exports.update = update
module.exports.updatePassword = updatePassword
module.exports.remove = remove
