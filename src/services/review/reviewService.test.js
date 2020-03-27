jest.mock('services/http/httpService.js')

import qsStringify from 'qs-stringify'
import HttpService from 'services/http/httpService.js'
import reviewService from 'services/review/reviewService.js'

describe('reviewService', () => {
  beforeEach(() => {
    HttpService.get.mockReset()
    HttpService.post.mockReset()
    HttpService.put.mockReset()
    HttpService.patch.mockReset()
    HttpService.remove.mockReset()
  })

  describe('getAll', () => {
    it('gets all reviews', () => {
      const endpoint = '/reviews'
      const queryFields = {
        selectFields: ['rating']
      }
      const response = [{reviewId: '1', rating: '4'}]

      HttpService.get.mockReturnValue(Promise.resolve(response))

      return reviewService.getAll({ ...queryFields })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.get).toHaveBeenCalledWith({ endpoint: `${endpoint}?${qsStringify(queryFields)}`})
      })
    })
  })

  describe('getById', () => {
    it('gets review by id', () => {
      const endpoint = '/reviews/1'
      const queryFields = {
        selectFields: ['rating']
      }
      const response = [{reviewId: '1', rating: '4'}]

      HttpService.get.mockReturnValue(Promise.resolve(response))

      return reviewService.getById({ reviewId: 1, ...queryFields })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.get).toHaveBeenCalledWith({ endpoint: `${endpoint}?${qsStringify(queryFields)}` })
      })
    })
  })

  describe('create', () => {
    it('creates a review for a given account', () => {
      const endpoint = '/reviews'
      const body = {
        accountId: '1',
        scooterId: '3',
        rating: '4',
        text: 'Awesome scooter'
      }
      const response = { message: 'review created' }

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return reviewService.create({ ...body })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('edit', () => {
    it('deletes an review for a given reviewId', () => {
      const endpoint = '/reviews/1'
      const body = {
        updateMap: { rating: '4' }
      }
      const response = { message: 'review updated' }

      HttpService.put.mockReturnValue(Promise.resolve(response))

      return reviewService.edit({ reviewId: 1, ...body })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.put).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('remove', () => {
    it('deletes an review for a given reviewId', () => {
      const endpoint = '/reviews/1'
      const response = { message: 'review deleted' }

      HttpService.remove.mockReturnValue(Promise.resolve(response))

      return reviewService.remove({ reviewId: 1 })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.remove).toHaveBeenCalledWith({ endpoint })
      })
    })
  })
})
