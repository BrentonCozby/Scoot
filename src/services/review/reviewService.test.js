jest.mock('services/http/httpService.js')

import HttpService from 'services/http/httpService.js'
import reviewService from 'services/review/reviewService.js'

describe('reviewService', () => {
  beforeEach(() => {
    HttpService.post.mockReset()
    HttpService.put.mockReset()
    HttpService.remove.mockReset()
  })

  describe('getAll', () => {
    it('gets all reviews', () => {
      const endpoint = '/reviews/get'
      const body = {
        all: true,
        selectFields: ['rating']
      }
      const response = [{reviewId: '1', rating: '4'}]

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return reviewService.getAll({ selectFields: body.selectFields })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('getWhere', () => {
    it('gets all reviews for a given accountId', () => {
      const endpoint = '/reviews/get'
      const body = {
        where: {
          accountId: '1'
        },
        selectFields: ['rating']
      }
      const response = [{reviewId: '1', rating: '4'}]

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return reviewService.getWhere(body)
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('createReview', () => {
    it('creates an review for a given account', () => {
      const endpoint = '/reviews/create'
      const body = {
        accountId: '1',
        reviewData: { rating: '4' }
      }
      const response = { message: 'review created' }

      HttpService.post.mockReturnValue(Promise.resolve(response))

      return reviewService.createReview({ accountId: body.accountId, reviewData: body.reviewData })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.post).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('deleteReview', () => {
    it('deletes an review for a given reviewId', () => {
      const endpoint = '/reviews/delete'
      const body = {
        reviewId: '1'
      }
      const response = { message: 'review deleted' }

      HttpService.remove.mockReturnValue(Promise.resolve(response))

      return reviewService.deleteReview({ reviewId: body.reviewId })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.remove).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })

  describe('editReview', () => {
    it('deletes an review for a given reviewId', () => {
      const endpoint = '/reviews/edit'
      const body = {
        reviewId: '1',
        updateMap: { rating: '4' }
      }
      const response = { message: 'review updated' }

      HttpService.put.mockReturnValue(Promise.resolve(response))

      return reviewService.editReview({ reviewId: body.reviewId, updateMap: body.updateMap })
      .then(res => {
        expect(res).toEqual(response)
        expect(HttpService.put).toHaveBeenCalledWith({ endpoint, body })
      })
    })
  })
})
