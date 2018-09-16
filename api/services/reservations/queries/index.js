const { query } = require('../../../../database/index.js')
const {
  sanitize,
  camelCaseMapKeys,
  decamelizeList,
  to
} = require('@utils/index.js')
const decamelize = require('decamelize')

const READABLE_RESERVATION_COLUMNS = [
  'reservation_id',
  'account_id',
  'scooter_id',
  'start_date',
  'end_date'
]

const EDITABLE_RESERVATION_COLUMNS = [
  'start_date',
  'end_date'
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
  'description',
  'geom'
]

async function getAll({
  selectFields = [],
  orderBy,
  distanceFrom
}) {
  const READABLE_COLUMNS = [...READABLE_RESERVATION_COLUMNS, ...READABLE_ACCOUNT_COLUMNS, ...READABLE_SCOOTER_COLUMNS]

  let columns = ['reservation_id', 'account_id', 'scooter_id']

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
      if (column === 'geom') {
        return 'ST_AsText(scooter.geom) as geom'
      }

      return `scooter.${column}`
    }

    return `reservation.${column}`
  })

  if (distanceFrom) {
    columns.push(`ST_Distance(scooter.geom, ST_GeomFromText('POINT(${distanceFrom.lng} ${distanceFrom.lat})', 26910)) as distance`)
  }

  let queryString = `SELECT ${columns.join(', ')} FROM Reservation`

  if (joinsAccountTable) {
    queryString += ' LEFT JOIN account ON reservation.account_id = account.account_id'
  }

  if (joinsScooterTable) {
    queryString += ' LEFT JOIN scooter ON reservation.scooter_id = scooter.scooter_id'
  }

  if (orderBy) {
    queryString += ' ORDER BY ' + Object.entries(orderBy).map(([column, direction]) => {
      return `reservation.${decamelize(column)} ${direction.toUpperCase()}`
    }).join(', ')
  }

  const [err, result] = await to(query(queryString))

  if (err) {
    return Promise.reject(err)
  }

  return result.rows.map(row => camelCaseMapKeys(row))
}

async function getWhere({
  where,
  selectFields = [],
  orderBy,
  distanceFrom
}) {
  const READABLE_COLUMNS = [...READABLE_RESERVATION_COLUMNS, ...READABLE_ACCOUNT_COLUMNS, ...READABLE_SCOOTER_COLUMNS]

  let columns = ['reservation_id', 'account_id', 'scooter_id']

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
      if (column === 'geom') {
        return 'ST_AsText(scooter.geom) as geom'
      }

      return `scooter.${column}`
    }

    return `reservation.${column}`
  })

  if (distanceFrom) {
    columns.push(`ST_Distance(scooter.geom, ST_GeomFromText('POINT(${distanceFrom.lng} ${distanceFrom.lat})', 26910)) as distance`)
  }

  let queryString = `SELECT ${columns.join(', ')} FROM Reservation`

  if (joinsAccountTable) {
    queryString += ' INNER JOIN account ON reservation.account_id = account.account_id'
  }

  if (joinsScooterTable) {
    queryString += ' INNER JOIN scooter ON reservation.scooter_id = scooter.scooter_id'
  }

  let placeholderCounter = 1
  let conditions = []
  Object.entries(where).forEach(([columnName, value]) => {
    if (['string', 'number', 'boolean'].indexOf(typeof value) === -1) {
      return
    }

    if (READABLE_RESERVATION_COLUMNS.includes(decamelize(columnName))) {
      conditions.push(`reservation.${decamelize(columnName)}=$${placeholderCounter++}`)
    }

    if (READABLE_ACCOUNT_COLUMNS.includes(decamelize(columnName))) {
      conditions.push(`account.${decamelize(columnName)}=$${placeholderCounter++}`)
    }

    if (READABLE_SCOOTER_COLUMNS.includes(decamelize(columnName))) {
      conditions.push(`scooter.${decamelize(columnName)}=$${placeholderCounter++}`)
    }
  })

  if (conditions.length) {
    queryString += ` WHERE ${conditions.join(' AND ')}`
  }

  if (orderBy) {
    queryString += ' ORDER BY ' + Object.entries(orderBy).map(([column, direction]) => {
      return `reservation.${decamelize(column)} ${direction.toUpperCase()}`
    }).join(', ')
  }

  const queryData = Object.values(where).filter(value => ['string', 'number', 'boolean'].indexOf(typeof value) >= 0)

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(err)
  }

  return result.rows.map(camelCaseMapKeys)
}

async function create({
  accountId,
  scooterId,
  data
}) {
  const editableColumns = ['account_id', 'scooter_id', ...EDITABLE_RESERVATION_COLUMNS]
  const columns = ['account_id', 'scooter_id']
  const values = ['$1', '$2']
  const queryData = [parseInt(accountId), parseInt(scooterId)]
  let placeholderCounter = values.length + 1

  Object.entries(data).forEach(([column, value]) => {
    if (editableColumns.indexOf(decamelize(column)) === -1) {
      return
    }

    columns.push(decamelize(column))

    values.push(`$${placeholderCounter++}`)

    queryData.push(value)
  })

  const queryString = `INSERT INTO Reservation(${columns.join(', ')}) VALUES(${values.join(', ')}) RETURNING *`

  return query(queryString, sanitize(queryData))
}

async function update({
  reservationId,
  updateMap
}) {
  const set = []
  const queryData = [parseInt(reservationId)]
  let placeholderCounter = queryData.length + 1

  Object.entries(updateMap).forEach(([column, value]) => {
    if (EDITABLE_RESERVATION_COLUMNS.indexOf(decamelize(column)) === -1) {
      return
    }

    set.push(`${decamelize(column)}=$${placeholderCounter++}`)

    queryData.push(value)
  })

  const queryString = `UPDATE Reservation SET ${set.join(', ')} WHERE reservation_id=$1 RETURNING *`

  return query(queryString, sanitize(queryData))
}

async function remove({
  reservationId
}) {
  const queryString = 'DELETE FROM Reservation WHERE reservation_id=$1 RETURNING *'
  const data = [parseInt(reservationId)]

  return query(queryString, data)
}

module.exports.getAll = getAll
module.exports.getWhere = getWhere
module.exports.create = create
module.exports.update = update
module.exports.remove = remove
