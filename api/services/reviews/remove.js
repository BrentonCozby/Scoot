const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRoles, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res, next) {
  let isAuthorizedByRole = true
  const {reviewId} = req.params

  const pathValidation = validateRequiredParams(['reviewId'], req.params)

  if (!pathValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      pathParamsErrors: pathValidation.messageMap
    })
  }

  let [getErr, reviews] = await to(queries.get({
    where: {
      reviewId
    }
  }))

  if (getErr) {
    return next(getErr)
  }

  if (!reviews[0]) {
    return res.status(204)
  }

  if (reviews[0].accountId !== req.user.accountId) {
    const rolesList = (req.user.roles || '').split(' ')

    isAuthorizedByRole = verifyOneOfRoles(['admin', 'manager'], rolesList)
  }

  if (!isAuthorizedByRole) {
    return res.status(403).json({ message: 'Forbidden by role', roles: req.user.roles })
  }

  const [deleteErr] = await to(queries.remove({reviewId}))

  if (deleteErr) {
    return next(deleteErr)
  }

  res.status(204)
}

module.exports = [
  authMiddleware,
  routeHandler
]
