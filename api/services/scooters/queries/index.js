const { query } = require('../../../../database/index.js')
const { sanitize, camelCaseMapKeys, decamelizeList, to } = require('@utils/index.js')
const decamelize = require('decamelize')

const READABLE_SCOOTER_FIELDS = [
  'scooter_id',
  'model',
  'photo',
  'color',
  'description',
  'geom'
]

const EDITABLE_SCOOTER_FIELDS = [
  'model',
  'photo',
  'color',
  'description',
  'lat',
  'lng'
]

const READABLE_REVIEW_FIELDS = [
  'avg_rating'
]

const READABLE_RESERVATION_FIELDS = [
  'start_date',
  'end_date'
]

const dataTypeMap = {
  scooterId: 'number',
  model: 'string',
  photo: 'string',
  color: 'string',
  description: 'string',
  avgRating: 'number',
  startDate: 'number',
  endDate: 'number'
}

async function get({
  selectFields = [],
  where,
  orderBy,
  distanceFrom = {}
}) {
  const READABLE_FIELDS = [...READABLE_SCOOTER_FIELDS, ...READABLE_REVIEW_FIELDS, ...READABLE_RESERVATION_FIELDS]

  let fields = ['scooter_id']

  if (selectFields[0] === '*' || selectFields.length === 0) {
    fields = READABLE_FIELDS
  } else {
    fields = [...new Set(fields.concat(decamelizeList(selectFields).filter(field => READABLE_FIELDS.includes(field))))]
  }

  const joinsReviewTable =
    fields.some(field => READABLE_REVIEW_FIELDS.includes(field)) ||
    Object.keys(where || {}).some(field => READABLE_REVIEW_FIELDS.includes(field))

  const joinsReservationTable =
    fields.some(field => READABLE_RESERVATION_FIELDS.includes(field)) ||
    Object.keys(where || {}).some(field => READABLE_RESERVATION_FIELDS.includes(field))

  fields = fields.map(field => {
    if (READABLE_REVIEW_FIELDS.includes(field)) {
      if (field === 'avg_rating' || (where && where.hasOwnProperty('avgRating'))) {
        return `AVG(review.rating) as avg_rating, COUNT(review.rating) as review_count`
      }

      return `review.${field}`
    }

    if (READABLE_RESERVATION_FIELDS.includes(field)) {
      return `reservation.${field}`
    }

    if (field === 'geom') {
      return 'ST_AsText(scooter.geom) as geom'
    }

    return `scooter.${field}`
  })

  const {lng, lat} = distanceFrom
  if (lng && lat) {
    fields.push(`ST_Distance(scooter.geom, ST_GeomFromText('POINT(${lng} ${lat})', 26910)) as distance`)
  }

  let queryString = `SELECT ${fields.join(', ')} FROM Scooter`

  if (joinsReviewTable) {
    queryString += ` \nLEFT JOIN\n review ON scooter.scooter_id = review.scooter_id`
  }

  if (joinsReservationTable) {
    queryString += ` \n${where ? 'INNER' : 'LEFT'} JOIN\n reservation ON scooter.scooter_id = reservation.scooter_id`
  }

  let placeholderCounter = 1
  let conditions = []
  Object.entries(where || {}).forEach(([field, value]) => {
    if (['string', 'number', 'boolean'].indexOf(typeof value) === -1) {
      return
    }

    const operator = dataTypeMap[field] === 'string' ? 'ILIKE' : '='

    if (READABLE_SCOOTER_FIELDS.includes(decamelize(field))) {
      conditions.push(`scooter.${decamelize(field)} ${operator} $${placeholderCounter++}`)
    }

    if (READABLE_REVIEW_FIELDS.includes(decamelize(field))) {
      if (field === 'avgRating') {
        return
      }

      conditions.push(`review.${decamelize(field)} ${operator} $${placeholderCounter++}`)
    }

    if (READABLE_RESERVATION_FIELDS.includes(decamelize(field))) {
      conditions.push(`reservation.${decamelize(field)} ${operator} $${placeholderCounter++}`)
    }
  })

  const {xmin, xmax, ymin, ymax} = (where || {}).bounds || {}
  if (xmin && xmax && ymin && ymax) {
    conditions.push(`scooter.geom && ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 26910)`)
  }

  if (conditions.length) {
    queryString += ` \nWHERE\n ${conditions.join(' AND ')}`

    if (where.reservedBetween && where.reservedBetween.min && where.reservedBetween.max) {
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
    } else if (where.availableBetween && where.availableBetween.min && where.availableBetween.max) {
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

    if (groups.length) {
      queryString += ` \nGROUP BY\n ${groups.join(', ')}`
    }
  }

  if (where && where.avgRating) {
    queryString += ` \nHAVING\n AVG(review.rating) >= ${where.avgRating}`
  }

  if (orderBy) {
    queryString += ' \nORDER BY\n ' + Object.entries(orderBy).map(([field, direction]) => {
      return `${decamelize(field)} ${direction.toUpperCase()}`
    }).join(', ')
  }

  const queryData = []
  Object.entries(where || {}).filter(([key, value]) => {
    if (key === 'avgRating') {
      return
    }

    if (['string', 'number', 'boolean'].indexOf(typeof value) >= 0) {
      queryData.push(value)
    }
  })

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(new Error(`\nnode-postgres ${err.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

async function create({
  model,
  photo,
  color,
  description,
  lat,
  lng
}) {
  let fields = ['model', 'photo', 'color', 'description', 'geom']
  const values = ['$1', '$2', '$3', '$4', `ST_GeomFromText('POINT(${lng} ${lat})', 26910)`]
  const queryData = [model, photo, color, description]

  const queryString = `INSERT INTO scooter(${fields.join(', ')}) VALUES(${values.join(', ')}) RETURNING *`

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(new Error(`\nnode-postgres ${err.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

async function update({
  scooterId,
  updateMap
}) {
  const set = []
  const queryData = [parseInt(scooterId)]

  let placeholderCounter = queryData.length + 1
  Object.entries(updateMap).forEach(([field, value]) => {
    if (EDITABLE_SCOOTER_FIELDS.indexOf(decamelize(field)) === -1) {
      return
    }

    if (['lat', 'lng'].indexOf(field) >= 0) {
      return
    }

    set.push(`${decamelize(field)}=$${placeholderCounter++}`)

    queryData.push(value)
  })

  if (typeof updateMap.lat === 'number' && typeof updateMap.lng === 'number') {
    set.push(`geom=ST_GeomFromText('POINT(${updateMap.lng} ${updateMap.lat})', 26910)`)
  }

  const queryString = `UPDATE Scooter SET ${set.join(', ')} WHERE scooter_id=$1 RETURNING *`

  const [err, result] = await to(query(queryString, sanitize(queryData)))

  if (err) {
    return Promise.reject(new Error(`\nnode-postgres ${err.toString()}`))
  }

  return result.rows.map(camelCaseMapKeys)
}

async function remove({ scooterId }) {
  const queryString = 'DELETE FROM Scooter WHERE scooter_id=$1 RETURNING *'
  const queryData = [parseInt(scooterId)]

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
