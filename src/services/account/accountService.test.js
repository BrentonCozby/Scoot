jest.mock('services/http/httpService.js')

import HttpService from 'services/http/httpService.js'
import AccountService from 'services/account/accountService.js'
import qsStringify from 'qs-stringify'

describe('AccountService', () => {
  beforeEach(() => {
    HttpService.get.mockReset()
    HttpService.post.mockReset()
    HttpService.put.mockReset()
    HttpService.patch.mockReset()
    HttpService.remove.mockReset()
  })

  describe('getAll', () => {
    it('gets all accounts', () => {
      const endpoint = '/accounts'
      const queryFields = {
        selectFields: ['firstName']
      }
      const response = [{accountId: '1', firstName: 'Patrick'}]

      HttpService.get.mockReturnValue(Promise.resolve(response))

      return AccountService.getAll({ ...queryFields })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.get).toHaveBeenCalledWith({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
      })
    })
  })

  describe('getById', () => {
    it('gets account data for a given accountId', () => {
      const endpoint = `/accounts/1`
      const queryFields = {
        selectFields: ['firstName']
      }
      const response = [{accountId: '1', firstName: 'Patrick'}]

      HttpService.get.mockReturnValue(Promise.resolve(response))

      return AccountService.getById({accountId: 1, ...queryFields})
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.get).toHaveBeenCalledWith({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
      })
    })
  })

  describe('create', () => {
    it('creates a account for a given account', () => {
      const endpoint = '/accounts'
      const body = {
        firstName: 'Patrick',
        lastName: 'Star',
        email: 'patrick.star@gmail.com',
        password: 'patrick',
        roles: 'admin'
      }
      const response = { message: 'Account created' }

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return AccountService.create(body)
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('remove', () => {
    it('deletes an account for a given accountId', () => {
      const endpoint = '/accounts/1'
      const response = { message: 'Account deleted' }

      HttpService.remove.mockReturnValue(Promise.resolve(response))

      return AccountService.remove({ accountId: 1 })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.remove).toHaveBeenCalledWith({ endpoint })
      })
    })
  })

  describe('edit', () => {
    it('deletes an account for a given accountId', () => {
      const endpoint = `/accounts/1`
      const body = {
        updateMap: { firstName: '120.00' }
      }
      const response = { message: 'Account updated' }

      HttpService.put.mockReturnValue(Promise.resolve(response))

      return AccountService.edit({ accountId: 1, ...body })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.put).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })
})
