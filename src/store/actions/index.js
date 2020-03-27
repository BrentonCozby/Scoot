import to from 'utils/await-to.js'
import { getCurrentPosition } from 'services/map/mapService.js'
import ScooterService from 'services/scooter/scooterService.js'

export const SET_CURRENT_POSITION = 'SET_CURRENT_POSITION'
export const UPDATE_MAP_BOUNDS = 'UPDATE_MAP_BOUNDS'
export const UPDATE_SCOOTER_LIST = 'UPDATE_SCOOTER_LIST'

export async function updateCurrentPosition() {
  const [err, { lat, lng }] = await to(getCurrentPosition())

  return {
    type: SET_CURRENT_POSITION,
    lat: err ? '' : lat,
    lng: err ? '' : lng,
  }
}

export async function updateMapBounds({ xmin, ymin, xmax, ymax }) {
  return {
    type: UPDATE_MAP_BOUNDS,
    xmin, ymin, xmax, ymax
  }
}

export async function updateScooterList({ where, distanceFrom, selectFields, orderBy }) {
  const [err, scooterList] = await to(ScooterService.getAll({
    where,
    distanceFrom,
    selectFields,
    orderBy
  }))

  return {
    type: UPDATE_SCOOTER_LIST,
    scooterList: err ? [] : scooterList || []
  }
}
