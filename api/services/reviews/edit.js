const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRoles, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res, next) {
  const {reviewId} = req.params
  const {updateMap} = req.body

  const pathValidation = validateRequiredParams(['reviewId'], req.params)
  const bodyValidation = validateRequiredParams(['updateMap'], req.body)

  if (!pathValidation.isValid || !bodyValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      pathParamsErrors: pathValidation.messageMap,
      requestBodyErrors: bodyValidation.messageMap
    })
  }

  const [getErr, reviews] = await to(queries.get({
    where: {
      reviewId
    }
  }))

  if (getErr) {
    return next(getErr)
  }

  if (!reviews[0]) {
    return res.status(404).json({
      message: `Could not find review with reviewId: ${reviewId}`,
      pathParamsErrors: {
        reviewId: 'Not found'
      }
    })
  }

  let isAuthorizedByRole = true

  if (review.accountId !== req.user.accountId) {
    const rolesList = (req.user.roles || '').split(' ')

    isAuthorizedByRole = verifyOneOfRoles(['admin', 'manager'], rolesList)
  }

  if (!isAuthorizedByRole) {
    return res.status(403).json({ message: 'Forbidden by role', roles: req.user.roles })
  }

  const [updateErr] = await to(queries.updateReview({reviewId, updateMap}))

  if (updateErr) {
    return next(updateErr)
  }

  res.json({ message: `Review updated with reviewId: ${reviewId}` })
}

module.exports = [
  authMiddleware,
  routeHandler
]
