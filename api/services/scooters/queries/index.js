const { query } = require('../../../../database/index.js')
const { sanitize, camelCaseMapKeys, decamelizeList, to } = require('@utils/index.js')
const decamelize = require('decamelize')

const READABLE_SCOOTER_COLUMNS = [
  'scooter_id',
  'model',
  'photo',
  'color',
  'description',
  'geom'
]

const EDITABLE_SCOOTER_COLUMNS = [
  'model',
  'photo',
  'color',
  'description',
  'lat',
  'lng'
]

const READABLE_REVIEW_COLUMNS = [
  'avg_rating'
]

const READABLE_RESERVATION_COLUMNS = [
  'start_date',
  'end_date'
]

async function getWhere({ where = {}, selectFields, orderBy, distanceFrom }) {
  const READABLE_COLUMNS = [...READABLE_SCOOTER_COLUMNS, ...READABLE_REVIEW_COLUMNS, ...READABLE_RESERVATION_COLUMNS]

  let columns = ['scooter_id']

  if (selectFields[0] === '*') {
    columns = READABLE_COLUMNS
  } else {
    columns = columns.concat(decamelizeList(selectFields).filter(field => READABLE_COLUMNS.includes(field)))
  }

  const joinsReviewTable = columns.some(field => READABLE_REVIEW_COLUMNS.includes(field)) || Object.keys(where).some(field => READABLE_REVIEW_COLUMNS.includes(field))
  const joinsReservationTable = columns.some(field => READABLE_RESERVATION_COLUMNS.includes(field)) || Object.keys(where).some(field => READABLE_RESERVATION_COLUMNS.includes(field))

  columns = columns.map(column => {
    if (READABLE_REVIEW_COLUMNS.includes(column)) {
      if (column === 'avg_rating') {
        return `AVG(review.rating) as avg_rating, COUNT(review.rating) as review_count`
      }

      return `review.${column}`
    }

    if (READABLE_RESERVATION_COLUMNS.includes(column)) {
      return `reservation.${column}`
    }

    if (column === 'geom') {
      let str =  'ST_AsText(scooter.geom) as geom'

      return str
    }

    return `scooter.${column}`
  })

  if (distanceFrom) {
    columns.push(`ST_Distance(scooter.geom, ST_GeomFromText('POINT(${distanceFrom.lng} ${distanceFrom.lat})', 26910)) as distance`)
  }

  let queryString = `SELECT ${columns.join(', ')} FROM Scooter`

  if (joinsReviewTable) {
    queryString += ' LEFT JOIN review ON scooter.scooter_id = review.scooter_id'
  }

  if (joinsReservationTable) {
    queryString += ' LEFT JOIN reservation ON scooter.scooter_id = reservation.scooter_id'
  }

  let placeholderCounter = 1
  let conditions = Object.keys(where).map(columnName => {
    if (READABLE_COLUMNS.includes(decamelize(columnName))) {
      return `scooter.${decamelize(columnName)}=$${placeholderCounter++}`
    }
  }).filter(v => Boolean(v))

  if (where.hasOwnProperty('bounds')) {
    conditions.push(`scooter.geom && ST_MakeEnvelope(${where.bounds.xmin}, ${where.bounds.ymin}, ${where.bounds.xmax}, ${where.bounds.ymax}, 26910)`)
  }

  if (conditions.length) {
    queryString += ` WHERE ${conditions.join(' AND ')}`

    if (where.reservedBetween) {
      queryString += `
        AND scooter.scooter_id IN (
          SELECT reservation.scooter_id
          FROM reservation
          WHERE (
            reservation.start_date BETWEEN '${where.reservedBetween.min}' AND '${where.reservedBetween.max}'
            OR reservation.end_date BETWEEN '${where.reservedBetween.min}' AND '${where.reservedBetween.max}'
          )
        )
      `
    } else if (where.availableBetween) {
      queryString += `
        AND scooter.scooter_id NOT IN (
          SELECT reservation.scooter_id
          FROM reservation
          WHERE (
            reservation.start_date BETWEEN '${where.availableBetween.min}' AND '${where.availableBetween.max}'
            OR reservation.end_date BETWEEN '${where.availableBetween.min}' AND '${where.availableBetween.max}'
          )
        )
      `
    }
  }

  if (joinsReviewTable || joinsReservationTable) {
    const groups = []

    if (joinsReviewTable && selectFields.includes('avgRating')) {
      groups.push('scooter.scooter_id')
    }

    queryString += ` GROUP BY ${groups.join(', ')}`
  }

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

function createScooter({ data }) {
  let columns = []
  const values = []
  const queryData = []
  let placeholderCounter = values.length + 1

  Object.entries(data).forEach(([column, value]) => {
    if (EDITABLE_SCOOTER_COLUMNS.indexOf(decamelize(column)) === -1) {
      return
    }

    if (['lat', 'lng'].indexOf(column) >= 0) {
      return
    }

    columns.push(decamelize(column))
    values.push(`$${placeholderCounter++}`)
    queryData.push(value)
  })

  if (typeof data.lat === 'number' && typeof data.lng === 'number') {
    columns.push('geom')
    values.push(`ST_GeomFromText('POINT(${data.lng} ${data.lat})', 26910)`)
  }

  const queryString = `INSERT INTO scooter(${columns.join(', ')}) VALUES(${values.join(', ')}) RETURNING *`

  return query(queryString, sanitize(queryData))
}

function updateScooter({ scooterId, updateMap }) {
  const set = []
  const queryData = [parseInt(scooterId)]
  let placeholderCounter = queryData.length + 1

  Object.entries(updateMap).forEach(([column, value]) => {
    if (EDITABLE_SCOOTER_COLUMNS.indexOf(decamelize(column)) === -1) {
      return
    }

    if (['lat', 'lng'].indexOf(column) >= 0) {
      return
    }

    set.push(`${decamelize(column)}=$${placeholderCounter++}`)

    queryData.push(value)
  })

  if (typeof updateMap.lat === 'number' && typeof updateMap.lng === 'number') {
    set.push(`geom=ST_GeomFromText('POINT(${updateMap.lng} ${updateMap.lat})', 26910)`)
  }

  const queryString = `UPDATE Scooter SET ${set.join(', ')} WHERE scooter_id=$1 RETURNING *`

  return query(queryString, sanitize(queryData))
}

function deleteScooter({ scooterId }) {
  const queryString = 'DELETE FROM Scooter WHERE scooter_id=$1 RETURNING *'
  const queryData = [parseInt(scooterId)]

  return query(queryString, queryData)
}

module.exports.getWhere = getWhere
module.exports.createScooter = createScooter
module.exports.updateScooter = updateScooter
module.exports.deleteScooter = deleteScooter
