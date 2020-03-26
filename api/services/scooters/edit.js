const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRolesMiddleware, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res, next) {
  const {scooterId} = req.params
  const {updateMap} = req.body

  const pathValidation = validateRequiredParams(['scooterId'], req.body)
  const bodyValidation = validateRequiredParams(['updateMap'], req.body)

  if (!pathValidation.isValid || !bodyValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      pathParamsErrors: pathValidation.messageMap,
      requestBodyErrors: bodyValidation.messageMap
    })
  }

  const [getErr, scooters] = await to(queries.get({
    where: {
      scooterId
    }
  }))

  if (getErr) {
    return next(getErr)
  }

  if (!scooters[0]) {
    return res.status(404).json({
      message: `Could not find scooter with scooterId: ${scooterId}`,
      pathParamsErrors: {
        scooterId: 'Not found'
      }
    })
  }

  const [updateErr] = await to(queries.update({scooterId, updateMap}))

  if (updateErr) {
    return next(updateErr)
  }

  res.json({ message: `Scooter updated with scooterId: ${req.body.scooterId}` })
}

module.exports = [
  authMiddleware,
  verifyOneOfRolesMiddleware(['admin', 'manager']),
  routeHandler
]
