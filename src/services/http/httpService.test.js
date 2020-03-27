import * as AuthService from 'services/auth/authService.js'
import * as HttpService from './httpService.js'

describe('HttpService', () => {
  let fetchResponse

  beforeEach(() => {
    process.env.REACT_APP_API_BASE_URI = 'http://localhost:4001'

    AuthService.getEncodedAccessToken = jest.fn(() => 'accessToken')

    fetchResponse = {
      json: jest.fn(() => ({foo: 'foo'})),
      ok: true,
      status: 200
    }

    window.fetch = jest.fn(() => Promise.resolve(fetchResponse))
  })

  describe('baseRequest', () => {
    it('sends request to api endpoint with access token and returns data as json', () => {
      const expectedRequest = {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer accessToken'
        }
      }

      return HttpService.baseRequest({
        endpoint: '/reservations',
        method: 'GET'
      })
      .then((res) => {
        expect(res).toEqual(fetchResponse.json())
        expect(fetch).toHaveBeenCalledWith('http://localhost:4001/reservations', expectedRequest)
      })
    })
  })

  describe('baseRequest', () => {
    it('returns rejected promise with json from response on error', () => {
      fetchResponse = {
        json: jest.fn(() => ({ message: 'invalid value' })),
        ok: false,
        status: 406
      }

      window.fetch = jest.fn(() => Promise.resolve(fetchResponse))

      return HttpService.baseRequest({
        endpoint: '/reservations',
        method: 'GET'
      })
      .catch((res) => {
        expect(res).toEqual(fetchResponse.json())
      })
    })
  })

  describe('get', () => {
    it('sends a baseRequest with method of GET', () => {
      const expectedRequest = {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer accessToken'
        }
      }

      return HttpService.post({endpoint: '/reservations'})
      .then((res) => {
        expect(res).toEqual(fetchResponse.json())
        expect(fetch).toHaveBeenCalledWith('http://localhost:4001/reservations', expectedRequest)
      })
    })
  })

  describe('post', () => {
    it('sends a baseRequest with method of POST', () => {
      const body = { email: '1234' }

      const expectedRequest = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Authorization': 'Bearer accessToken',
          'Content-Type': 'application/json'
        }
      }

      return HttpService.post({
        endpoint: '/reservations',
        body
      })
      .then((res) => {
        expect(res).toEqual(fetchResponse.json())
        expect(fetch).toHaveBeenCalledWith('http://localhost:4001/reservations', expectedRequest)
      })
    })
  })

  describe('put', () => {
    it('sends a baseRequest with method of POST', () => {
      const body = { email: 'foo@gmail.com' }

      const expectedRequest = {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
          'Authorization': 'Bearer accessToken',
          'Content-Type': 'application/json'
        }
      }

      return HttpService.put({
        endpoint: '/reservations/2',
        body
      })
      .then((res) => {
        expect(res).toEqual(fetchResponse.json())
        expect(fetch).toHaveBeenCalledWith('http://localhost:4001/reservations/2', expectedRequest)
      })
    })
  })

  describe('patch', () => {
    it('sends a baseRequest with method of POST', () => {
      const body = { email: 'foo@gmail.com' }

      const expectedRequest = {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
          'Authorization': 'Bearer accessToken',
          'Content-Type': 'application/json'
        }
      }

      return HttpService.put({
        endpoint: '/reservations/2',
        body
      })
      .then((res) => {
        expect(res).toEqual(fetchResponse.json())
        expect(fetch).toHaveBeenCalledWith('http://localhost:4001/reservations/2', expectedRequest)
      })
    })
  })

  describe('remove', () => {
    it('sends a baseRequest with method of POST', () => {
      const expectedRequest = {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer accessToken'
        }
      }

      return HttpService.remove({endpoint: '/reservations/2'})
      .then((res) => {
        expect(res).toEqual(fetchResponse.json())
        expect(fetch).toHaveBeenCalledWith('http://localhost:4001/reservations/2', expectedRequest)
      })
    })
  })
})
