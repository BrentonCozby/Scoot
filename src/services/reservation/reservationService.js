import HttpService from 'services/http/httpService.js'
import qsStringify from 'qs-stringify'

export function getAll({ selectFields, where, orderBy, distanceFrom }) {
  const endpoint = '/reservations'
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

  return HttpService.get({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
}

export function getById({ reservationId, selectFields, distanceFrom }) {
  const endpoint = `/reservations/${reservationId}`
  const queryFields = {}

  if (selectFields) queryFields.selectFields = selectFields
  if (distanceFrom) queryFields.distanceFrom = distanceFrom

  return HttpService.get({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
}

export function create({ accountId, scooterId, startDate, endDate }) {
  const endpoint = '/reservations'
  const body = {
    accountId,
    scooterId,
    startDate,
    endDate
  }

  return HttpService.post({ endpoint, body })
}

export function edit({ reservationId, updateMap }) {
  const endpoint = `/reservations/${reservationId}`
  const body = {
    updateMap
  }

  return HttpService.put({ endpoint, body })
}

export function remove({ reservationId }) {
  const endpoint = `/reservations/${reservationId}`

  return HttpService.remove({ endpoint })
}

export default {
  getAll,
  getById,
  create,
  edit,
  remove
}
