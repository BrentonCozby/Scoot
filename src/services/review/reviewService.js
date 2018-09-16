import HttpService from 'services/http/httpService.js'

export function getAll({ selectFields }) {
  const endpoint = '/reviews/get'
  const body = {
    all: true,
    selectFields
  }

  return HttpService.post({ endpoint, body })
}

export function getWhere({ where, selectFields }) {
  const endpoint = '/reviews/get'
  const body = {
    where,
    selectFields
  }

  return HttpService.post({ endpoint, body })
}

export function createReview({ accountId, scooterId, data }) {
  const endpoint = '/reviews/create'
  const body = {
    accountId,
    scooterId,
    data
  }

  return HttpService.post({ endpoint, body })
}

export function deleteReview({ reviewId }) {
  const endpoint = '/reviews/delete'
  const body = {
    reviewId
  }

  return HttpService.remove({ endpoint, body })
}

export function editReview({ reviewId, updateMap }) {
  const endpoint = '/reviews/edit'
  const body = {
    reviewId,
    updateMap
  }

  return HttpService.put({ endpoint, body })
}

export default {
  getAll,
  getWhere,
  createReview,
  deleteReview,
  editReview
}
