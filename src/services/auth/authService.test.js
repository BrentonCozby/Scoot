jest.mock('services/http/httpService.js')
jest.mock('jsonwebtoken')
jest.mock('../../history.js', () => ({
  redirect: jest.fn()
}))

import AuthService from './authService.js'
import HttpService from 'services/http/httpService.js'
import jwt from 'jsonwebtoken'
import history from '../../history.js'
import qsStringify from 'qs-stringify'

window.localStorage = {
  storage: {},
  getItem(key) {
    return this.storage[key]
  },
  setItem(key, value) {
    this.storage[key] = value
  },
  removeItem(key) {
    delete this.storage[key]
  }
}

describe('AuthService', () => {
  beforeEach(() => {
    window.localStorage.storage = {}
  })

  describe('setSession', () => {
    it('saves a given accessToken to local storage', () => {
      AuthService.setSession('eyaccessToken1234')

      expect(window.localStorage.getItem('accessToken')).toBe('eyaccessToken1234')
    })
  })

  describe('clearSession', () => {
    it('deletes a given accessToken from local storage', () => {
      localStorage.setItem('accessToken', 'eyaccessToken1234')

      AuthService.clearSession()

      expect(localStorage.getItem('accessToken')).toBe(null)
    })
  })

  describe('createToken', () => {
    it('posts a request to create a token to the accounting-app api', () => {
      HttpService.get.mockReturnValue(Promise.resolve())

      const endpoint = '/create-token'
      const queryFields = { email: 'foo@gmail.com', password: 'foo' }

      AuthService.createToken({ ...queryFields })

      expect(HttpService.get).toHaveBeenCalledWith({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
    })
  })

  describe('login', () => {
    it('creates an accessToken and saves it to localStorage', () => {
      HttpService.get.mockReturnValue(Promise.resolve({ accessToken: 'eyaccessToken1234' }))

      return AuthService.login({ email: 'foo@gmail.com', password: 'foo' })
      .then(() => {
        expect(HttpService.get).toHaveBeenCalled()
        expect(localStorage.getItem('accessToken')).toBe('eyaccessToken1234')
      })
    })

    it('redirects to dashboard', () => {
      HttpService.post.mockReturnValue(Promise.resolve({ accessToken: 'eyaccessToken1234' }))

      return AuthService.login({ email: 'foo@gmail.com', password: 'foo' })
      .then(res => {
        expect(history.redirect).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('logout', () => {
    it('deletes the access token in local storage', () => {
      localStorage.setItem('accessToken', 'eyaccessToken1234')

      AuthService.logout()

      expect(localStorage.getItem('accessToken')).toBe(null)
    })

    it('redirects to home page', () => {
      AuthService.logout()

      expect(history.redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('getEncodedAccessToken', () => {
    it('returns the token in local storage', () => {
      localStorage.setItem('accessToken', 'eyaccessToken1234')

      expect(AuthService.getEncodedAccessToken()).toBe('eyaccessToken1234')
    })
  })

  describe('getDecodedAccessToken', () => {
    it('returns the decoded access token', () => {
      const mockAccessToken = {
        accountId: '1234',
        exp: new Date().getTime() + 600000
      }

      jwt.verify.mockImplementationOnce(() => mockAccessToken)

      localStorage.setItem('accessToken', JSON.stringify(mockAccessToken))

      expect(AuthService.getDecodedAccessToken()).toEqual(mockAccessToken)
    })

    it('returns empty object when no decodable access token is found in storage', () => {
      localStorage.setItem('accessToken', undefined)

      expect(AuthService.getDecodedAccessToken()).toEqual({})
    })
  })

  describe('getTokenExpirationMs', () => {
    it('returns the token expiration in milliseconds', () => {
      const expiration = new Date().getTime() + 600000

      const mockAccessToken = {
        expirationMs: expiration
      }

      jwt.verify.mockImplementationOnce(() => mockAccessToken)

      localStorage.setItem('accessToken', JSON.stringify(mockAccessToken))

      expect(AuthService.getTokenExpirationMs()).toBe(expiration)
    })
  })

  describe('isAuthenticated', () => {
    it('returns true when token exists and is not expired', () => {
      const mockAccessToken = {
        expirationMs: new Date().getTime() + 600000
      }

      jwt.verify.mockImplementationOnce(() => mockAccessToken)

      localStorage.setItem('accessToken', JSON.stringify(mockAccessToken))

      expect(AuthService.isAuthenticated()).toBe(true)
    })

    it('returns false when token exists but is expired', () => {
      const mockAccessToken = {
        expirationMs: new Date().getTime() - 900000
      }

      jwt.verify.mockImplementationOnce(() => mockAccessToken)

      localStorage.setItem('accessToken', JSON.stringify(mockAccessToken))

      expect(AuthService.isAuthenticated()).toBe(false)
    })

    it('returns false when token does not exist', () => {
      jwt.verify.mockImplementationOnce(() => undefined)

      localStorage.setItem('accessToken', '')

      expect(AuthService.isAuthenticated()).toBe(false)
    })
  })
})
