const { query } = require('../../../../database/index.js')
const { sanitize, camelCaseMapKeys, decamelizeList, to } = require('@utils/index.js')
const decamelize = require('decamelize')

const READABLE_REVIEW_COLUMNS = [
  'review_id',
  'account_id',
  'scooter_id',
  'rating',
  'text',
  'date'
]

const EDITABLE_REVIEW_COLUMNS = [
  'rating',
  'text'
]

const READABLE_ACCOUNT_COLUMNS = [
  'first_name',
  'last_name',
  'email',
  'roles'
]

const READABLE_SCOOTER_COLUMNS = [
  'model',
  'photo',
  'color',
  'weight',
  'description'
]

async function getAll({ selectFields = [] }) {
  const READABLE_COLUMNS = [...READABLE_REVIEW_COLUMNS, ...READABLE_ACCOUNT_COLUMNS, ...READABLE_SCOOTER_COLUMNS]

  let columns = ['account_id', 'scooter_id']

  if (selectFields[0] === '*') {
    columns = READABLE_COLUMNS
  } else {
    columns = columns.concat(decamelizeList(selectFields).filter(field => READABLE_COLUMNS.includes(field)))
  }

  const joinsAccountTable = columns.some(field => READABLE_ACCOUNT_COLUMNS.includes(field))
  const joinsScooterTable = columns.some(field => READABLE_SCOOTER_COLUMNS.includes(field))

  columns = columns.map(column => {
    if (READABLE_ACCOUNT_COLUMNS.includes(column)) {
      return `account.${column}`
    }

    if (READABLE_SCOOTER_COLUMNS.includes(column)) {
      return `scooter.${column}`
    }

    return `review.${column}`
  })

  let queryString = `SELECT ${columns.join(', ')} FROM Review`

  if (joinsAccountTable) {
    queryString += ' INNER JOIN account ON review.account_id = account.account_id'
  }

  if (joinsScooterTable) {
    queryString += ' INNER JOIN scooter ON review.scooter_id = scooter.scooter_id'
  }

  if (columns.includes('date') && columns.includes('time')) {
    queryString += ' ORDER BY date DESC, time DESC'
  }

  const [err, result] = await to(query(queryString))

  if (err) {
    return Promise.reject(err)
  }

  return result.rows.map(row => camelCaseMapKeys(row))
}

async function getWhere({ where, selectFields = [] }) {
  const READABLE_COLUMNS = [...READABLE_REVIEW_COLUMNS, ...READABLE_ACCOUNT_COLUMNS]

  let columns = ['review_id', 'account_id', 'scooter_id']

  if (selectFields[0] === '*') {
    columns = READABLE_COLUMNS
  } else {
    columns = columns.concat(decamelizeList(selectFields).filter(field => READABLE_COLUMNS.includes(field)))
  }

  const joinsAccountTable = columns.some(field => READABLE_ACCOUNT_COLUMNS.includes(field)) || Object.keys(where).some(field => READABLE_ACCOUNT_COLUMNS.includes(field))
  const joinsScooterTable = columns.some(field => READABLE_SCOOTER_COLUMNS.includes(field)) || Object.keys(where).some(field => READABLE_SCOOTER_COLUMNS.includes(field))

  columns = columns.map(column => {
    if (READABLE_ACCOUNT_COLUMNS.includes(column)) {
      return `account.${column}`
    }

    if (READABLE_SCOOTER_COLUMNS.includes(column)) {
      return `scooter.${column}`
    }

    return `review.${column}`
  })

  let queryString = `SELECT ${columns.join(', ')} FROM Review`

  if (joinsAccountTable) {
    queryString += ' INNER JOIN account ON review.account_id = account.account_id'
  }

  if (joinsScooterTable) {
    queryString += ' INNER JOIN scooter ON review.scooter_id = scooter.scooter_id'
  }

  let placeholderCounter = 1
  let conditions = []
  Object.entries(where).forEach(([columnName, value]) => {
    if (['string', 'number', 'boolean'].indexOf(typeof value) === -1) {
      return
    }

    if (READABLE_REVIEW_COLUMNS.includes(decamelize(columnName))) {
      conditions.push(`review.${decamelize(columnName)}=$${placeholderCounter++}`)
    }

    if (READABLE_SCOOTER_COLUMNS.includes(decamelize(columnName))) {
      conditions.push(`scooter.${decamelize(columnName)}=$${placeholderCounter++}`)
    }

    if (READABLE_ACCOUNT_COLUMNS.includes(decamelize(columnName))) {
      conditions.push(`account.${decamelize(columnName)}=$${placeholderCounter++}`)
    }
  })

  queryString += ` WHERE ${conditions.join(' AND ')}`

  if (columns.includes('date') && columns.includes('time')) {
    queryString += ' ORDER BY date DESC, time DESC'
  }

  const queryData = Object.values(where).filter(value => ['string', 'number', 'boolean'].indexOf(typeof value) >= 0)

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(err)
  }

  return result.rows.map(camelCaseMapKeys)
}

async function createReview({ accountId, scooterId, data }) {
  const columns = ['account_id', 'scooter_id']
  const values = ['$1', '$2']
  const queryData = [parseInt(accountId), parseInt(scooterId)]
  let placeholderCounter = values.length + 1

  Object.entries(data).forEach(([key, value]) => {
    if (EDITABLE_REVIEW_COLUMNS.indexOf(decamelize(key)) === -1) {
      return
    }

    columns.push(decamelize(key))
    values.push(`$${placeholderCounter}`)
    queryData.push(value)

    placeholderCounter++
  })

  const queryString = `INSERT INTO Review(${columns.join(', ')}) VALUES(${values.join(', ')}) RETURNING *`

  return query(queryString, sanitize(queryData));
}

async function updateReview({ reviewId, updateMap }) {
  const columns = []
  const queryData = [parseInt(reviewId)]
  let placeholderCounter = values.length + 1

  Object.entries(updateMap).forEach(([key, value]) => {
    if (EDITABLE_REVIEW_COLUMNS.indexOf(decamelize(key)) === -1) {
      return
    }

    columns.push(`${decamelize(key)}=$${placeholderCounter}`)
    queryData.push(value)

    placeholderCounter++
  })

  const queryString = `UPDATE Review SET ${columns.join(', ')} WHERE review_id=$1 RETURNING *`

  return query(queryString, sanitize(queryData));
}

async function deleteReview({ reviewId }) {
  const queryString = 'DELETE FROM Review WHERE review_id=$1 RETURNING *'
  const data = [parseInt(reviewId)]

  return query(queryString, data);
}

module.exports.getAll = getAll
module.exports.getWhere = getWhere
module.exports.createReview = createReview
module.exports.updateReview = updateReview
module.exports.deleteReview = deleteReview
