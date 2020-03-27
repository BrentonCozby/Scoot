const { query } = require('../../../../database/index.js')
const {
  sanitize,
  camelCaseMapKeys,
  decamelizeList,
  to
} = require('@utils/index.js')
const decamelize = require('decamelize')

const READABLE_RESERVATION_FIELDS = [
  'reservation_id',
  'account_id',
  'scooter_id',
  'start_date',
  'end_date'
]

const EDITABLE_RESERVATION_FIELDS = [
  'start_date',
  'end_date'
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
  reservationId: 'number',
  accountId: 'number',
  scooterId: 'number',
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
  orderBy,
  distanceFrom = {},
  betweenDates = {}
}) {
  const READABLE_FIELDS = [...READABLE_RESERVATION_FIELDS, ...READABLE_ACCOUNT_FIELDS, ...READABLE_SCOOTER_FIELDS]

  let fields = ['reservation_id', 'account_id', 'scooter_id']

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

    return `reservation.${field}`
  })

  const {lng, lat} = distanceFrom
  if (lng && lat) {
    fields.push(`ST_Distance(scooter.geom, ST_GeomFromText('POINT(${lng} ${lat})', 26910)) as distance`)
  }

  let queryString = `SELECT ${fields.join(', ')} FROM Reservation`

  if (joinsAccountTable) {
    queryString += ` ${where ? 'INNER' : 'LEFT'} JOIN account ON reservation.account_id = account.account_id`
  }

  if (joinsScooterTable) {
    queryString += ` ${where ? 'INNER' : 'LEFT'} JOIN scooter ON reservation.scooter_id = scooter.scooter_id`
  }

  let placeholderCounter = 1
  let conditions = []
  Object.entries(where || {}).forEach(([field, value]) => {
    if (['string', 'number', 'boolean'].indexOf(typeof value) === -1) {
      return
    }

    const operator = dataTypeMap[field] === 'string' ? 'ILIKE' : '='

    if (READABLE_RESERVATION_FIELDS.includes(decamelize(field))) {
      conditions.push(`reservation.${decamelize(field)} ${operator} $${placeholderCounter++}`)
    }

    if (READABLE_ACCOUNT_FIELDS.includes(decamelize(field))) {
      conditions.push(`account.${decamelize(field)} ${operator} $${placeholderCounter++}`)
    }

    if (READABLE_SCOOTER_FIELDS.includes(decamelize(field))) {
      conditions.push(`scooter.${decamelize(field)} ${operator} $${placeholderCounter++}`)
    }
  })

  if (conditions.length) {
    queryString += ` WHERE ${conditions.join(' AND ')}`
  }

  const {startDate, endDate} = betweenDates
  if (startDate && endDate) {
    queryString += ` ${conditions.length ? ' AND' :  ' WHERE'}`
    queryString += ` (reservation.start_date BETWEEN '${startDate}' and '${endDate}'`
    queryString += ` OR reservation.end_date BETWEEN '${startDate}' and '${endDate}')`
  }

  if (orderBy) {
    queryString += ' ORDER BY ' + Object.entries(orderBy).map(([field, direction]) => {
      return `reservation.${decamelize(field)} ${direction.toUpperCase()}`
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
  accountId,
  scooterId,
  startDate,
  endDate
}) {
  const columns = ['account_id', 'scooter_id', 'start_date', 'end_date']
  const values = ['$1', '$2', '$3', '$4']
  const queryData = [parseInt(accountId), parseInt(scooterId), startDate, endDate]

  const queryString = `INSERT INTO Reservation(${columns.join(', ')}) VALUES(${values.join(', ')}) RETURNING *`

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(new Error(`\nnode-postgres ${err.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

async function update({
  reservationId,
  updateMap
}) {
  const set = []
  const queryData = [parseInt(reservationId)]
  let placeholderCounter = queryData.length + 1

  Object.entries(updateMap).forEach(([field, value]) => {
    if (EDITABLE_RESERVATION_FIELDS.indexOf(decamelize(field)) === -1) {
      return
    }

    set.push(`${decamelize(field)}=$${placeholderCounter++}`)

    queryData.push(value)
  })

  const queryString = `UPDATE Reservation SET ${set.join(', ')} WHERE reservation_id=$1 RETURNING *`

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(new Error(`\nnode-postgres ${err.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

async function remove({
  reservationId
}) {
  const queryString = 'DELETE FROM Reservation WHERE reservation_id=$1 RETURNING *'
  const queryData = [parseInt(reservationId)]

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(new Error(`\nnode-postgres ${err.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

module.exports.get = get
module.exports.create = create
module.exports.update = update
module.exports.remove = remove
