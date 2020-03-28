const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRoles, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res, next) {
  const {reservationId} = req.params
  const {updateMap} = req.body

  const pathValidation = validateRequiredParams(['reservationId'], req.params)
  const bodyValidation = validateRequiredParams(['updateMap'], req.body)

  if (!pathValidation.isValid || !bodyValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      pathParamsErrors: pathValidation.messageMap,
      requestBodyErrors: bodyValidation.messageMap
    })
  }

  const [getErr, resultList] = await to(queries.get({
    where: {
      reservationId
    }
  }))

  if (getErr) {
    return next(getErr)
  }

  if (!resultList[0]) {
    return res.status(404).json({
      message: `Could not find reservation with reservationId: ${reservationId}`,
      pathParamsErrors: {
        reservationId: 'Not found'
      }
    })
  }

  let isAuthorizedByRole = true

  if (accountId !== req.user.accountId) {
    const rolesList = (req.user.roles || '').split(' ')

    isAuthorizedByRole = verifyOneOfRoles(['admin', 'manager'], rolesList)
  }

  if (!isAuthorizedByRole) {
    return res.status(403).json({ message: 'Forbidden by role', roles: req.user.roles })
  }

  const [updateErr] = await to(queries.update({reservationId, updateMap}))

  if (updateErr) {
    return next(updateErr)
  }

  res.json({ message: `Reservation updated with reservationId: ${reservationId}` })
}

module.exports = [
  authMiddleware,
  routeHandler
]
