jest.mock('services/http/httpService.js')

import qsStringify from 'qs-stringify'
import HttpService from 'services/http/httpService.js'
import reservationService from 'services/reservation/reservationService.js'

describe('reservationService', () => {
  beforeEach(() => {
    HttpService.get.mockReset()
    HttpService.post.mockReset()
    HttpService.put.mockReset()
    HttpService.patch.mockReset()
    HttpService.remove.mockReset()
  })

  describe('getAll', () => {
    it('gets all reservations', () => {
      const endpoint = '/reservations'
      const queryFields = {
        selectFields: ['lastName'],
        where: {
          firstName: 'patrick'
        },
      }
      const response = [
        {reservationId: '1', amount: '100.00', firstName: 'patrick', lastName: 'star'},
        {reservationId: '2', amount: '72.00', firstName: 'patrick', lastName: 'star'}
      ]

      HttpService.get.mockReturnValue(Promise.resolve(response))

      return reservationService.getAll({ ...queryFields })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.get).toHaveBeenCalledWith({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
      })
    })
  })

  describe('getById', () => {
    it('gets reservation by reservationId', () => {
      const endpoint = '/reservations/1'
      const queryFields = {
        selectFields: ['lastName'],
      }
      const response = [
        {reservationId: '1', lastName: 'star'}
      ]

      HttpService.get.mockReturnValue(Promise.resolve(response))

      return reservationService.getById({ reservationId: 1, ...queryFields })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.get).toHaveBeenCalledWith({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
      })
    })
  })

  describe('create', () => {
    it('creates an reservation for a given account', () => {
      const endpoint = '/reservations'
      const body = {
        accountId: '1',
        scooterId: '2',
        startDate: '2020-03-24',
        endDate: '2020-03-27'
      }
      const response = { message: 'reservation created' }

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return reservationService.create({ ...body })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('edit', () => {
    it('deletes an reservation for a given reservationId', () => {
      const endpoint = '/reservations/1'
      const body = {
        updateMap: { endDate: '2020-03-25' }
      }
      const response = { message: 'reservation updated' }

      HttpService.put.mockReturnValue(Promise.resolve(response))

      return reservationService.edit({ reservationId: 1, ...body })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.put).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('remove', () => {
    it('deletes an reservation for a given reservationId', () => {
      const endpoint = '/reservations/1'
      const response = { message: 'reservation deleted' }

      HttpService.remove.mockReturnValue(Promise.resolve(response))

      return reservationService.remove({ reservationId: 1 })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.remove).toHaveBeenCalledWith({ endpoint })
      })
    })
  })
})
