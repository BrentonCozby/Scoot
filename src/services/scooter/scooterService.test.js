jest.mock('services/http/httpService.js')

import HttpService from 'services/http/httpService.js'
import ScooterService from 'services/scooter/scooterService.js'
import { Object } from 'core-js';

describe('ScooterService', () => {
  beforeEach(() => {
    HttpService.post.mockReset()
    HttpService.put.mockReset()
    HttpService.remove.mockReset()
  })

  describe('getWhere', () => {
    it('gets scooter data for a given scooterId', () => {
      const endpoint = '/scooters/get'
      const body = {
        where: {
          scooterId: '1'
        },
        selectFields: ['model']
      }
      const response = [{scooterId: '1', model: 'Patrick'}]

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return ScooterService.getWhere(body)
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body })
      })
    })

    it('parses geom into lat and lng', () => {
      const endpoint = '/scooters/get'
      const body = {
        where: {
          scooterId: '1'
        },
        selectFields: ['geom']
      }
      const response = [{scooterId: '1', geom: 'POINT(-80.111111, 20.111111)'}]

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return ScooterService.getWhere(body)
      .then(res => {
        expect(res).toEqual({...response,
          lat: 20.111111,
          lng: 80.111111
        })
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('createScooter', () => {
    it('creates a scooter for a given scooter', () => {
      const endpoint = '/scooters/create'
      const body = {
        scooterId: '1',
        firstName: 'Patrick',
        lastName: 'Star',
        email: 'patrick.star@gmail.com',
        password: 'patrick',
        roles: 'admin'
      }
      const response = { message: 'Scooter created' }

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return ScooterService.createScooter({
        scooterId: body.scooterId,
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

  describe('deleteScooter', () => {
    it('deletes a scooter for a given scooterId', () => {
      const endpoint = '/scooters/delete'
      const body = {
        scooterId: '1'
      }
      const response = { message: 'Scooter deleted' }

      HttpService.remove.mockReturnValue(Promise.resolve(response))

      return ScooterService.deleteScooter({ scooterId: body.scooterId })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.remove).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('editScooter', () => {
    it('deletes an scooter for a given scooterId', () => {
      const endpoint = '/scooters/edit'
      const body = {
        scooterId: '1',
        updateMap: { amount: '120.00' }
      }
      const response = { message: 'Scooter updated' }

      HttpService.put.mockReturnValue(Promise.resolve(response))

      return ScooterService.editScooter({ scooterId: body.scooterId, updateMap: body.updateMap })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.put).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })
})
