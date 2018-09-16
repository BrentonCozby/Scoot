import HttpService from 'services/http/httpService.js'
import to from 'utils/await-to.js'

function parseGeom(scooter) {
  const [lng, lat] = scooter.geom.slice(6, -1).split(' ')

  scooter.lat = parseFloat(lat)
  scooter.lng = parseFloat(lng)

  return scooter
}

export async function getWhere({ where, selectFields, orderBy, distanceFrom }) {
  const endpoint = '/scooters/get'
  const body = {
    where,
    selectFields,
    orderBy,
    distanceFrom
  }

  let [err, scooterList] = await to(HttpService.post({ endpoint, body }))

  if (err) {
    return []
  }

  if (selectFields.includes('geom')) {
    scooterList = scooterList.map(parseGeom)
  }

  return scooterList || []
}

export function createScooter({ photo, photoUpload, model, color, description, lat, lng }) {
  const endpoint = '/scooters/create'
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

export function deleteScooter({ scooterId }) {
  const endpoint = '/scooters/delete'
  const body = {
    scooterId,
  }

  return HttpService.remove({ endpoint, body })
}

export function editScooter({ scooterId, updateMap, photoUpload }) {
  const endpoint = '/scooters/edit'
  const body = {
    scooterId,
    updateMap
  }

  return HttpService.put({ endpoint, body })
}

export function uploadScooterImage({ scooterId, image }) {
  const endpoint = '/scooters/uploadImage'
  const formData = new FormData()

  formData.append('scooterId', scooterId)
  formData.append('image', image)

  return HttpService.put({ endpoint, formData })
}

export default {
  getWhere,
  createScooter,
  deleteScooter,
  editScooter,
  uploadScooterImage
}
