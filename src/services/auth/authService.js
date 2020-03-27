import jwt from 'jsonwebtoken'
import HttpService from 'services/http/httpService.js'
import history from '../../history.js'
import qsStringify from 'qs-stringify'

export function setSession(accessToken) {
  localStorage.setItem('accessToken', accessToken)
}

export function clearSession() {
  localStorage.removeItem('accessToken')
}

export function createToken({ email, password }) {
  const endpoint = '/create-token'
  const queryFields = { email, password }

  return HttpService.get({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
}

export function login({ email, password }) {
  return createToken({ email, password })
  .then(res => {
    setSession(res.accessToken)
    history.redirect('/dashboard')
  })
}

export function logout() {
  clearSession()
  history.redirect('/login')
}

export function getEncodedAccessToken() {
  return localStorage.getItem('accessToken')
}

export function getDecodedAccessToken() {
  const token = getEncodedAccessToken() || {}
  let decodedToken = {}

  try {
    decodedToken = jwt.verify(token, new Buffer.from(process.env.REACT_APP_TOKEN_SECRET, 'base64')) || {}
  } catch(err) {
    clearSession()
    decodedToken = {}
  }

  return decodedToken
}

export function getTokenExpirationMs() {
  return getDecodedAccessToken().expirationMs
}

export function getAuthenticatedAccount() {
  return {
    accountId: getDecodedAccessToken().accountId || '',
    firstName: getDecodedAccessToken().firstName || '',
    lastName: getDecodedAccessToken().lastName || '',
    roles: (getDecodedAccessToken().roles || '').split(' ') || []
  }
}

export function isAuthenticated() {
  const tokenExists = Boolean(getEncodedAccessToken())
  const isTokenExpired = new Date().getTime() >= getTokenExpirationMs()

  return tokenExists && !isTokenExpired
}

export default {
  setSession,
  clearSession,
  createToken,
  login,
  logout,
  getEncodedAccessToken,
  getDecodedAccessToken,
  getTokenExpirationMs,
  getAuthenticatedAccount,
  isAuthenticated
}
