import HttpService from 'services/http/httpService.js'
import to from 'utils/await-to.js'
import qsStringify from 'qs-stringify'

export async function getAll({ selectFields, where, orderBy, distanceFrom }) {
  const endpoint = '/scooters'
  const queryFields = {}

  if (selectFields) queryFields.selectFields = selectFields
  if (where) queryFields.where = where
  if (orderBy) queryFields.orderBy = orderBy
  if (distanceFrom) queryFields.distanceFrom = distanceFrom

  if (queryFields.where) {
    Object.entries(queryFields.where).forEach(([key, value]) => {
      if (!value) {
        delete queryFields.where[key]
      }
    })
  }

  let [err, scooterList] = await to(HttpService.get({ endpoint: `${endpoint}?${qsStringify(queryFields)}` }))

  if (err) {
    return []
  }

  if (selectFields.includes('geom')) {
    scooterList = scooterList.map(parseGeom)
  }

  return scooterList || []
}

export async function getById({ scooterId, selectFields, distanceFrom }) {
  const endpoint = `/scooters/${scooterId}`
  const queryFields = {}

  if (selectFields) queryFields.selectFields = selectFields
  if (distanceFrom) queryFields.distanceFrom = distanceFrom

  let [err, scooterList] = await to(HttpService.get({ endpoint: `${endpoint}?${qsStringify(queryFields)}` }))

  if (err) {
    return {}
  }

  let scooter = scooterList[0]

  if (selectFields.includes('geom')) {
    scooter = parseGeom(scooter)
  }

  return scooter
}

export function create({ photo, photoUpload, model, color, description, lat, lng }) {
  const endpoint = '/scooters'
  const body = {
    photo,
    photoUpload,
    model,
    color,
    description,
    lat,
    lng
  }
  let formData = null

  if (body.photoUpload) {
    formData = new FormData()

    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, value)
    })
  }

  return HttpService.post({ endpoint, body, formData })
}

export function edit({ scooterId, updateMap, image }) {
  const endpoint = `/scooters/${scooterId}`
  let body = {
    updateMap
  }
  let formData = null

  if (image) {
    formData = new FormData()
    formData.append('image', image)

    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, value)
    })

    body = undefined
  }

  return HttpService.put({ endpoint, body, formData })
}

export function remove({ scooterId }) {
  const endpoint = `/scooters/${scooterId}`

  return HttpService.remove({ endpoint })
}

function parseGeom(scooter) {
  const [lng, lat] = scooter.geom.slice(6, -1).split(' ')

  scooter.lat = parseFloat(lat)
  scooter.lng = parseFloat(lng)

  return scooter
}

export default {
  getAll,
  getById,
  create,
  edit,
  remove
}
