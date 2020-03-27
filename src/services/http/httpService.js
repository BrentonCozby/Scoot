import { getEncodedAccessToken } from 'services/auth/authService.js'
import LoadingService from 'services/loading/loadingService.js'

export function baseRequest({
  endpoint,
  method,
  body,
  formData
}) {
  LoadingService.enqueue([endpoint])

  let requestParams = {
    method: method,
    headers: {
      'Authorization': `Bearer ${getEncodedAccessToken()}`
    }
  }

  if (body) {
    requestParams.headers['Content-Type'] = 'application/json'
    requestParams.body = JSON.stringify(body)
  }

  if (formData) {
    delete requestParams.headers['Content-Type']
    requestParams.body = formData
  }

  return fetch(`${process.env.REACT_APP_API_BASE_URI}${endpoint}`, requestParams)
  .then(async (res) => {
    if (!res.ok || res.status >= 400) {
      if (res.status === 401) {
        return Promise.reject('Account is unauthorized to take this action.')
      }

      return Promise.reject(await res.json())
    }

    LoadingService.dequeue([endpoint])

    return res.text().then(data => data ? JSON.parse(data) : {})
  })
  .catch((err) => {
    LoadingService.dequeue([endpoint])

    return Promise.reject(err)
  })
}

export function get({
  endpoint,
  formData
}) {
  return baseRequest({ endpoint, method: 'GET', formData })
}

export function post({
  endpoint,
  body,
  formData
}) {
  return baseRequest({ endpoint, method: 'POST', body, formData })
}

export function put({
  endpoint,
  body,
  formData
}) {
  return baseRequest({ endpoint, method: 'PUT', body, formData })
}

export function patch({
  endpoint,
  body,
  formData
}) {
  return baseRequest({ endpoint, method: 'PATCH', body, formData })
}

export function remove({
  endpoint,
  body,
  formData
}) {
  return baseRequest({ endpoint, method: 'DELETE', body, formData })
}

export default {
  baseRequest,
  get,
  post,
  put,
  patch,
  remove
}
