import HttpService from 'services/http/httpService.js'
import qsStringify from 'qs-stringify'

export function getAll({ selectFields, where, orderBy }) {
  const endpoint = '/reviews'
  const queryFields = {}

  if (selectFields) queryFields.selectFields = selectFields
  if (where) queryFields.where = where
  if (orderBy) queryFields.orderBy = orderBy

  if (queryFields.where) {
    Object.entries(queryFields.where).forEach(([key, value]) => {
      if (!value) {
        delete queryFields.where[key]
      }
    })
  }

  return HttpService.get({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
}

export function getById({ reviewId, selectFields}) {
  const endpoint = `/reviews/${reviewId}`
  const queryFields = {}

  if (selectFields) queryFields.selectFields = selectFields

  return HttpService.get({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
}

export function create({ accountId, scooterId, rating, text }) {
  const endpoint = '/reviews'
  const body = {
    accountId,
    scooterId,
    rating,
    text
  }

  return HttpService.post({ endpoint, body })
}

export function edit({ reviewId, updateMap }) {
  const endpoint = `/reviews/${reviewId}`
  const body = {
    updateMap
  }

  return HttpService.put({ endpoint, body })
}

export function remove({ reviewId }) {
  const endpoint = `/reviews/${reviewId}`

  return HttpService.remove({ endpoint })
}

export default {
  getAll,
  getById,
  create,
  edit,
  remove
}
