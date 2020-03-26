const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRolesMiddleware, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res, next) {
  const {scooterId} = req.params

  const pathValidation = validateRequiredParams(['scooterId'], req.params)

  if (!pathValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      pathParamsErrors: pathValidation.messageMap
    })
  }

  let [getErr, scooters] = await to(queries.get({
    where: {
      scooterId
    }
  }))

  if (getErr) {
    return next(getErr)
  }

  if (!scooters[0]) {
    return res.status(204).json({
      message: `Reservation deleted with scooterId: ${scooterId}`
    })
  }

  const [deleteErr] = await to(queries.remove({scooterId}))

  if (deleteErr) {
    return next(deleteErr)
  }

  res.status(204).json({
    message: `Reservation deleted with scooterId: ${scooterId}`
  })
}

module.exports = [
  authMiddleware,
  verifyOneOfRolesMiddleware(['admin', 'manager']),
  routeHandler
]
