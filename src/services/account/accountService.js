import HttpService from 'services/http/httpService.js'
import AuthSerivce from 'services/auth/authService.js'

export function getAll({ selectFields, orderBy }) {
  const endpoint = '/accounts/get'
  const body = {
    all: true,
    selectFields,
    orderBy
  }

  return HttpService.post({ endpoint, body })
}

export function getWhere({ where, selectFields, orderBy }) {
  const endpoint = '/accounts/get'
  const body = {
    where,
    selectFields,
    orderBy
  }

  return HttpService.post({ endpoint, body })
}

export function createAccount({ accountId, email, password, firstName, lastName, roles }) {
  const endpoint = '/accounts/create'
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

export function deleteAccount({ accountId }) {
  const endpoint = '/accounts/delete'
  const body = {
    accountId,
  }

  return HttpService.remove({ endpoint, body })
  .then(() => {
    if (AuthSerivce.getDecodedAccessToken().accountId === accountId) {
      AuthSerivce.logout()
    }
  })
}

export function editAccount({ accountId, updateMap }) {
  const endpoint = '/accounts/edit'
  const body = {
    accountId,
    updateMap
  }

  return HttpService.put({ endpoint, body })
}

export default {
  getAll,
  getWhere,
  createAccount,
  deleteAccount,
  editAccount
}
