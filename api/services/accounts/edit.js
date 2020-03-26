const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRolesMiddleware, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res, next) {
  const {accountId} = req.params
  const {email, firstName, lastName, roles} = req.body

  const pathValidation = validateRequiredParams(['accountId'], req.params)
  const bodyValidation = validateRequiredParams(['updateMap'], req.body)

  if (!pathValidation.isValid || !bodyValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      pathParamsErrors: pathValidation.messageMap,
      requestBodyErrors: bodyValidation.messageMap
    })
  }

  const [getErr, accounts] = await to(queries.get({
    where: {
      accountId
    }
  }))

  if (getErr) {
    return next(getErr)
  }

  if (!accounts[0]) {
    return res.status(404).json({
      message: `Could not find account with accountId: ${accountId}`,
      pathParamsErrors: {
        accountId: 'Not found'
      }
    })
  }

  const [updateErr] = await to(queries.update({accountId, email, firstName, lastName, roles}))

  if (updateErr) {
    return next(updateErr)
  }

  res.json({ message: `Account updated with accountId: ${accountId}` })
}

module.exports = [
  authMiddleware,
  verifyOneOfRolesMiddleware(['admin', 'manager']),
  routeHandler
]
