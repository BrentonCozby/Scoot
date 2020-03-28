const { authMiddleware } = require('@root/authMiddleware.js')
const { validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res, next) {
  const {accountId, scooterId, rating, text} = req.body

  const bodyValidation = validateRequiredParams(['accountId', 'scooterId', 'rating', 'text'], req.body)

  if (!bodyValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      requestBodyErrors: bodyValidation.messageMap
    })
  }

  const [createErr, resultList] = await to(queries.createReview({ accountId, scooterId, rating, text }))

  if (createErr) {
    return next(createErr)
  }

  if (!resultList[0]) {
    return next('Review not created.')
  }

  res.status(201).json({ message: 'Review created', review: resultList[0] })
}

module.exports = [
  authMiddleware,
  routeHandler
]
