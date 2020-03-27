const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRoles, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res, next) {
  const {reservationId} = req.params

  const pathValidation = validateRequiredParams(['reservationId'], req.params)

  if (!pathValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      pathParamsErrors: pathValidation.messageMap
    })
  }

  let [getErr, reservations] = await to(queries.get({
    where: {
      reservationId
    }
  }))

  if (getErr) {
    return next(getErr)
  }

  if (!reservations[0]) {
    return res.status(200).json({
      message: `Reservation deleted with reservationId: ${reservationId}`
    })
  }

  let isAuthorizedByRole = true
  if (reservations[0].accountId !== req.user.accountId) {
    const rolesList = (req.user.roles || '').split(' ')

    isAuthorizedByRole = verifyOneOfRoles(['admin', 'manager'], rolesList)
  }

  if (!isAuthorizedByRole) {
    return res.status(403).json({ message: 'Forbidden by role', roles: req.user.roles })
  }

  const [deleteErr] = await to(queries.remove({reservationId}))

  if (deleteErr) {
    return next(deleteErr)
  }

  res.status(200).json({
    message: `Reservation deleted with reservationId: ${reservationId}`
  })
}

module.exports = [
  authMiddleware,
  routeHandler
]
