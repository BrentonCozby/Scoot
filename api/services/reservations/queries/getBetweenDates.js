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
  'description',
  'geom'
]

async function getBetweenDates({
  where,
  selectFields = [],
  orderBy,
  distanceFrom
}) {
  const READABLE_COLUMNS = [...READABLE_RESERVATION_COLUMNS, ...READABLE_ACCOUNT_COLUMNS]

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
        let str = 'ST_AsText(scooter.geom) as geom'

        return str
      }

      return `scooter.${column}`
    }

    if (READABLE_RESERVATION_COLUMNS.includes(column)) {
      return `reservation.${column}`
    }
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
  let conditions = Object.keys(where).map(columnName => {
    if (READABLE_COLUMNS.includes(decamelize(columnName))) {
      return `reservation.${decamelize(columnName)}=$${placeholderCounter++}`
    }
  }).filter(v => Boolean(v))

  const dateMin = where.betweenDates.min
  const dateMax = where.betweenDates.max

  queryString += ` WHERE ${conditions.join(' AND ')} ${conditions.length ?  ' AND' : ''}`
  queryString += ` (reservation.start_date BETWEEN '${dateMin}' and '${dateMax}'`
  queryString += ` OR reservation.end_date BETWEEN '${dateMin}' and '${dateMax}')`

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

module.exports = getBetweenDates
