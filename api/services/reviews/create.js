const { authMiddleware } = require('@root/authMiddleware.js')
const { validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res, next) {
  const {accountId, scooterId, rating, text} = req.body.accountId

  const bodyValidation = validateRequiredParams(['accountId', 'scooterId', 'rating', 'text'], req.body)

  if (!bodyValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      requestBodyErrors: bodyValidation.messageMap
    })
  }

  const [createErr, result] = await to(queries.createReview({ accountId, scooterId, rating, text }))

  if (createErr) {
    return next(createErr)
  }

  if (result.rowCount === 0) {
    return next('Review not created.')
  }

  res.json({ message: 'Review created' })
}

module.exports = [
  authMiddleware,
  routeHandler
]
