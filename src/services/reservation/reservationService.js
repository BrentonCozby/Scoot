import HttpService from 'services/http/httpService.js'

export function getAll({ selectFields, orderBy, distanceFrom }) {
  const endpoint = '/reservations/get'
  const body = {
    all: true,
    selectFields,
    orderBy,
    distanceFrom
  }

  return HttpService.post({ endpoint, body })
}

export function getWhere({ where, selectFields, orderBy, distanceFrom }) {
  const endpoint = '/reservations/get'
  const body = {
    where,
    selectFields,
    orderBy,
    distanceFrom
  }

  return HttpService.post({ endpoint, body })
}

export function createReservation({ accountId, scooterId, data }) {
  const endpoint = '/reservations/create'
  const body = {
    accountId,
    scooterId,
    data
  }

  return HttpService.post({ endpoint, body })
}

export function deleteReservation({ reservationId }) {
  const endpoint = '/reservations/delete'
  const body = {
    reservationId
  }

  return HttpService.remove({ endpoint, body })
}

export function editReservation({ reservationId, updateMap }) {
  const endpoint = '/reservations/edit'
  const body = {
    reservationId,
    updateMap
  }

  return HttpService.put({ endpoint, body })
}

export default {
  getAll,
  getWhere,
  createReservation,
  deleteReservation,
  editReservation
}
