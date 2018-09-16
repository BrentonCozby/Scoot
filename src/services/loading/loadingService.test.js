import * as LoadingService from './loadingService.js'

describe('LoadingService', () => {

  describe('isQueueEmpty', () => {
    it('initializes queue to be empty', () => {
      expect(LoadingService.isQueueEmpty()).toBe(true)
    })

    it('returns true when queue is empty', () => {
      LoadingService.clearQueue()

      expect(LoadingService.isQueueEmpty()).toBe(true)
    })

    it('returns false when queue is not empty', () => {
      LoadingService.clearQueue()
      LoadingService.enqueue(['foo'])

      expect(LoadingService.isQueueEmpty()).toBe(false)
    })
  })

  describe('enqueue', () => {
    it('adds one item to queue', () => {
      LoadingService.clearQueue()
      LoadingService.enqueue(['foo'])

      expect(LoadingService.getQueue()).toEqual(['foo'])
    })

    it('adds many items to queue', () => {
      LoadingService.clearQueue()
      LoadingService.enqueue(['foo', 'bar'])
      LoadingService.enqueue(['zap'])

      expect(LoadingService.getQueue()).toEqual(['foo', 'bar', 'zap'])
    })
  })

  describe('dequeue', () => {
    it('removes one item from queue', () => {
      LoadingService.clearQueue()
      LoadingService.enqueue(['foo', 'bar', 'zap'])
      LoadingService.dequeue(['bar'])

      expect(LoadingService.getQueue()).toEqual(['foo', 'zap'])
    })

    it('removes many items from queue', () => {
      LoadingService.clearQueue()
      LoadingService.enqueue(['foo', 'bar', 'zap'])
      LoadingService.dequeue(['foo', 'not-in-queue', 'zap'])

      expect(LoadingService.getQueue()).toEqual(['bar'])
    })
  })

  describe('clearQueue', () => {
    it('empties the queue', () => {
      LoadingService.enqueue(['foo', 'bar'])
      LoadingService.clearQueue()

      expect(LoadingService.getQueue()).toEqual([])
    })
  })
})
