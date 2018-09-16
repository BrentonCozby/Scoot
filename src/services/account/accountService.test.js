jest.mock('services/http/httpService.js')

import HttpService from 'services/http/httpService.js'
import AccountService from 'services/account/accountService.js'

describe('AccountService', () => {
  beforeEach(() => {
    HttpService.post.mockReset()
    HttpService.put.mockReset()
    HttpService.remove.mockReset()
  })

  describe('getAll', () => {
    it('gets all accounts', () => {
      const endpoint = '/accounts/get'
      const body = {
        all: true,
        selectFields: ['amount']
      }
      const response = [{accountId: '1', firstName: 'Patrick'}]

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return AccountService.getAll({ selectFields: body.selectFields })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('getWhere', () => {
    it('gets account data for a given accountId', () => {
      const endpoint = '/accounts/get'
      const body = {
        where: {
          accountId: '1'
        },
        selectFields: ['amount']
      }
      const response = [{accountId: '1', firstName: 'Patrick'}]

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return AccountService.getWhere(body)
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('createAccount', () => {
    it('creates a account for a given account', () => {
      const endpoint = '/accounts/create'
      const body = {
        accountId: '1',
        firstName: 'Patrick',
        lastName: 'Star',
        email: 'patrick.star@gmail.com',
        password: 'patrick',
        roles: 'admin'
      }
      const response = { message: 'Account created' }

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return AccountService.createAccount({
        accountId: body.accountId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
        roles: body.roles
      })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('deleteAccount', () => {
    it('deletes a account for a given accountId', () => {
      const endpoint = '/accounts/delete'
      const body = {
        accountId: '1'
      }
      const response = { message: 'Account deleted' }

      HttpService.remove.mockReturnValue(Promise.resolve(response))

      return AccountService.deleteAccount({ accountId: body.accountId })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.remove).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('editAccount', () => {
    it('deletes an account for a given accountId', () => {
      const endpoint = '/accounts/edit'
      const body = {
        accountId: '1',
        updateMap: { amount: '120.00' }
      }
      const response = { message: 'Account updated' }

      HttpService.put.mockReturnValue(Promise.resolve(response))

      return AccountService.editAccount({ accountId: body.accountId, updateMap: body.updateMap })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.put).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })
})
