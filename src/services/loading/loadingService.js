import sanitizeHtml from 'sanitize-html'

let _queue = []
const listeners = {}

export function isQueueEmpty() {
  return _queue.length === 0
}

export function getQueue() {
  return _queue.map(sanitizeHtml)
}

export function enqueue(itemsList) {
  _queue.push(...itemsList)

  triggerListeners()
}

export function dequeue(itemsList) {
  itemsList.forEach(item => {
    const index = _queue.indexOf(item)

    if (index >= 0) {
      _queue.splice(index, 1)
    }
  })

  triggerListeners()
}

export function clearQueue() {
  _queue = []
}

function triggerListeners() {
  Object.values(listeners).forEach(cb => cb(isQueueEmpty()))
}

export function listen(id, cb) {
  listeners[id] = cb
}

export default {
  isQueueEmpty,
  getQueue,
  enqueue,
  dequeue,
  clearQueue,
  listen
}
