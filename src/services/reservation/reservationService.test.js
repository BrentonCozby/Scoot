jest.mock('services/http/httpService.js')

import HttpService from 'services/http/httpService.js'
import reservationService from 'services/reservation/reservationService.js'

describe('reservationService', () => {
  beforeEach(() => {
    HttpService.post.mockReset()
    HttpService.put.mockReset()
    HttpService.remove.mockReset()
  })

  describe('getAll', () => {
    it('gets all reservations', () => {
      const endpoint = '/reservations/get'
      const body = {
        all: true,
        selectFields: ['amount']
      }
      const response = [{reservationId: '1', amount: '100.00'}]

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return reservationService.getAll({ selectFields: body.selectFields })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('getWhere', () => {
    it('gets all reservations for a given accountId', () => {
      const endpoint = '/reservations/get'
      const body = {
        where: {
          accountId: '1'
        },
        selectFields: ['amount']
      }
      const response = [{reservationId: '1', amount: '100.00'}]

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return reservationService.getWhere(body)
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('createReservation', () => {
    it('creates an reservation for a given account', () => {
      const endpoint = '/reservations/create'
      const body = {
        accountId: '1',
        reservationData: { amount: '100.00' }
      }
      const response = { message: 'reservation created' }

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return reservationService.createReservation({ accountId: body.accountId, reservationData: body.reservationData })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('deleteReservation', () => {
    it('deletes an reservation for a given reservationId', () => {
      const endpoint = '/reservations/delete'
      const body = {
        reservationId: '1'
      }
      const response = { message: 'reservation deleted' }

      HttpService.remove.mockReturnValue(Promise.resolve(response))

      return reservationService.deleteReservation({ reservationId: body.reservationId })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.remove).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('editReservation', () => {
    it('deletes an reservation for a given reservationId', () => {
      const endpoint = '/reservations/edit'
      const body = {
        reservationId: '1',
        updateMap: { amount: '120.00' }
      }
      const response = { message: 'reservation updated' }

      HttpService.put.mockReturnValue(Promise.resolve(response))

      return reservationService.editReservation({ reservationId: body.reservationId, updateMap: body.updateMap })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.put).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })
})
