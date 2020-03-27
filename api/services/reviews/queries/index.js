const { query } = require('../../../../database/index.js')
const { sanitize, camelCaseMapKeys, decamelizeList, to } = require('@utils/index.js')
const decamelize = require('decamelize')

const READABLE_REVIEW_FIELDS = [
  'review_id',
  'account_id',
  'scooter_id',
  'rating',
  'text',
  'date'
]

const EDITABLE_REVIEW_FIELDS = [
  'rating',
  'text'
]

const READABLE_ACCOUNT_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'roles'
]

const READABLE_SCOOTER_FIELDS = [
  'model',
  'photo',
  'color',
  'description',
  'geom'
]

const dataTypeMap = {
  reviewId: 'number',
  accountId: 'number',
  scooterId: 'number',
  rating: 'number',
  text: 'string',
  firstName: 'string',
  lastName: 'string',
  email: 'string',
  roles: 'string',
  model: 'string',
  photo: 'string',
  color: 'string',
  description: 'string'
}

async function get({
  selectFields = [],
  where,
  orderBy
}) {
  const READABLE_FIELDS = [...READABLE_REVIEW_FIELDS, ...READABLE_ACCOUNT_FIELDS, ...READABLE_SCOOTER_FIELDS]

  let fields = ['review_id', 'account_id', 'scooter_id']

  if (selectFields[0] === '*' || selectFields.length === 0) {
    fields = READABLE_FIELDS
  } else {
    fields = [...new Set(fields.concat(decamelizeList(selectFields).filter(field => READABLE_FIELDS.includes(field))))]
  }

  const joinsAccountTable =
    fields.some(field => READABLE_ACCOUNT_FIELDS.includes(field)) ||
    Object.keys(where || {}).some(field => READABLE_ACCOUNT_FIELDS.includes(field))
  const joinsScooterTable =
    fields.some(field => READABLE_SCOOTER_FIELDS.includes(field)) ||
    Object.keys(where || {}).some(field => READABLE_SCOOTER_FIELDS.includes(field))

  fields = fields.map(field => {
    if (READABLE_ACCOUNT_FIELDS.includes(field)) {
      return `account.${field}`
    }

    if (READABLE_SCOOTER_FIELDS.includes(field)) {
      if (field === 'geom') {
        return 'ST_AsText(scooter.geom) as geom'
      }

      return `scooter.${field}`
    }

    return `review.${field}`
  })

  let queryString = `SELECT ${fields.join(', ')} FROM Review`

  if (joinsAccountTable) {
    queryString += ' INNER JOIN account ON review.account_id = account.account_id'
  }

  if (joinsScooterTable) {
    queryString += ' INNER JOIN scooter ON review.scooter_id = scooter.scooter_id'
  }

  let placeholderCounter = 1
  let conditions = []
  Object.entries(where || {}).forEach(([field, value]) => {
    if (['string', 'number', 'boolean'].indexOf(typeof value) === -1) {
      return
    }

    const operator = dataTypeMap[field] === 'string' ? 'ILIKE' : '='

    if (READABLE_REVIEW_FIELDS.includes(decamelize(field))) {
      conditions.push(`review.${decamelize(field)} ${operator} $${placeholderCounter++}`)
    }

    if (READABLE_SCOOTER_FIELDS.includes(decamelize(field))) {
      conditions.push(`scooter.${decamelize(field)} ${operator} $${placeholderCounter++}`)
    }

    if (READABLE_ACCOUNT_FIELDS.includes(decamelize(field))) {
      conditions.push(`account.${decamelize(field)} ${operator} $${placeholderCounter++}`)
    }
  })

  if (conditions.length) {
    queryString += ` WHERE ${conditions.join(' AND ')}`
  }

  if (orderBy) {
    queryString += ' ORDER BY ' + Object.entries(orderBy).map(([field, direction]) => {
      return `review.${decamelize(field)} ${direction.toUpperCase()}`
    }).join(', ')
  }

  const queryData = Object.values(where || {}).filter(value => ['string', 'number', 'boolean'].indexOf(typeof value) >= 0)

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(new Error(`\nnode-postgres ${err.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

async function createReview({
  accountId,
  scooterId,
  rating,
  text
}) {
  const fields = ['account_id', 'scooter_id', 'rating', 'text']
  const values = ['$1', '$2', '$3', '$4']
  const queryData = [parseInt(accountId), parseInt(scooterId), rating, text]

  const queryString = `INSERT INTO Review(${fields.join(', ')}) VALUES(${values.join(', ')}) RETURNING *`

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(new Error(`\nnode-postgres ${err.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

async function updateReview({ reviewId, updateMap }) {
  const fields = []
  const queryData = [parseInt(reviewId)]
  let placeholderCounter = values.length + 1

  Object.entries(updateMap).forEach(([key, value]) => {
    if (EDITABLE_REVIEW_FIELDS.indexOf(decamelize(key)) === -1) {
      return
    }

    fields.push(`${decamelize(key)}=$${placeholderCounter}`)
    queryData.push(value)

    placeholderCounter++
  })

  const queryString = `UPDATE Review SET ${fields.join(', ')} WHERE review_id=$1 RETURNING *`

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(new Error(`\nnode-postgres ${err.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

async function deleteReview({ reviewId }) {
  const queryString = 'DELETE FROM Review WHERE review_id=$1 RETURNING *'
  const queryData = [parseInt(reviewId)]

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(new Error(`\nnode-postgres ${err.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

module.exports.get = get
module.exports.createReview = createReview
module.exports.updateReview = updateReview
module.exports.deleteReview = deleteReview
