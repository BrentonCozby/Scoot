import HttpService from 'services/http/httpService.js'
import AuthSerivce from 'services/auth/authService.js'
import qsStringify from 'qs-stringify'

export function getAll({ selectFields, where, orderBy }) {
  const endpoint = '/accounts'
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

export function getById({ accountId, selectFields }) {
  const endpoint = `/accounts/${accountId}`
  const queryFields = {}

  if (selectFields) queryFields.selectFields = selectFields

  return HttpService.get({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
}

export function create({ accountId, email, password, firstName, lastName, roles }) {
  const endpoint = '/accounts'
  const body = {
    accountId,
    email,
    password,
    firstName,
    lastName,
    roles
  }

  return HttpService.post({ endpoint, body })
}

export function edit({ accountId, updateMap }) {
  const endpoint = `/accounts/${accountId}`
  const body = {
    updateMap
  }

  return HttpService.put({ endpoint, body })
}

export function updatePassword({ accountId, newPassword }) {
  const endpoint = `/accounts/${accountId}`
  const body = {
    newPassword
  }

  return HttpService.put({ endpoint, body })
}

export function remove({ accountId }) {
  const endpoint = `/accounts/${accountId}`

  return HttpService.remove({ endpoint })
  .then(response => {
    if (AuthSerivce.getDecodedAccessToken().accountId === accountId) {
      AuthSerivce.logout()
    }

    return response
  })
}

export default {
  getAll,
  getById,
  create,
  edit,
  updatePassword,
  remove,
}
