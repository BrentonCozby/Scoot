jest.mock('services/http/httpService.js')

import HttpService from 'services/http/httpService.js'
import ScooterService from 'services/scooter/scooterService.js'
import qsStringify from 'qs-stringify'

describe('ScooterService', () => {
  beforeEach(() => {
    HttpService.get.mockReset()
    HttpService.post.mockReset()
    HttpService.put.mockReset()
    HttpService.patch.mockReset()
    HttpService.remove.mockReset()
  })

  describe('getAll', () => {
    it('gets all scooters with given conditions', () => {
      const endpoint = '/scooters'
      const queryFields = {
        selectFields: ['description'],
        where: {
          color: 'black'
        }
      }
      const response = [{scooterId: '1', description: 'Great scooter', color: 'black'}]

      HttpService.get.mockReturnValue(Promise.resolve(response))

      return ScooterService.getAll({ ...queryFields })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.get).toHaveBeenCalledWith({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
      })
    })

    it('parses geom into lat and lng', () => {
      const endpoint = '/scooters'
      const queryFields = {
        selectFields: ['geom']
      }
      const response = [{scooterId: '1', geom: 'POINT(-80.111111, 20.111111)', lat: 20.111111, lng: 80.111111}]

      HttpService.get.mockReturnValue(Promise.resolve(response))

      return ScooterService.getAll({ ...queryFields })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.get).toHaveBeenCalledWith({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
      })
    })
  })

  describe('getById', () => {
    it('gets a scooter by id', () => {
      const endpoint = `/scooters/1`
      const queryFields = {
        selectFields: ['color']
      }
      const response = [{scooterId: '1', color: 'black'}]

      HttpService.get.mockReturnValue(Promise.resolve(response))

      return ScooterService.getById({ scooterId: 1, ...queryFields })
      .then(res => {
        expect(res).toEqual(response[0])
        expect(HttpService.get).toHaveBeenCalledWith({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
      })
    })

    it('parses geom into lat and lng', () => {
      const endpoint = '/scooters/1'
      const queryFields = {
        selectFields: ['geom']
      }
      const response = [{scooterId: '1', geom: 'POINT(-80.111111, 20.111111)', lat: 20.111111, lng: 80.111111}]

      HttpService.get.mockReturnValue(Promise.resolve(response))

      return ScooterService.getById({ scooterId: 1, ...queryFields })
      .then(res => {
        expect(res).toEqual(response[0])
        expect(HttpService.get).toHaveBeenCalledWith({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
      })
    })
  })

  describe('create', () => {
    it('creates a scooter for a given scooter', () => {
      const endpoint = '/scooters'
      const body = {
        photo: 'https://foo.com/some-image.jpg',
        photoUpload: undefined,
        model: 'Latest one',
        color: 'black',
        description: 'You will love this',
        lat: 80.00000,
        lng: 20.11111
      }
      const response = { message: 'Scooter created' }

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return ScooterService.create({ ...body })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body, formData: null })
      })
    })

    it('creates a scooter for a given scooter with a photoUpload', () => {
      const endpoint = '/scooters'
      const body = {
        photo: undefined,
        photoUpload: 'some-file.jpg',
        model: 'Latest one',
        color: 'black',
        description: 'You will love this',
        lat: 80.00000,
        lng: 20.11111
      }
      const response = { message: 'Scooter created' }

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return ScooterService.create({ ...body })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body, formData: expect.objectContaining(new FormData)})
      })
    })
  })

  describe('edit', () => {
    it('edits a scooter for a given scooterId', () => {
      const endpoint = '/scooters/1'
      const body = {
        updateMap: { color: 'red' }
      }
      const response = { message: 'Scooter updated' }

      HttpService.put.mockReturnValue(Promise.resolve(response))

      return ScooterService.edit({ scooterId: 1, ...body })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.put).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('remove', () => {
    it('deletes a scooter for a given scooterId', () => {
      const endpoint = '/scooters/1'
      const response = { message: 'Scooter deleted' }

      HttpService.remove.mockReturnValue(Promise.resolve(response))

      return ScooterService.remove({ scooterId: 1 })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.remove).toHaveBeenCalledWith({ endpoint })
      })
    })
  })
})
