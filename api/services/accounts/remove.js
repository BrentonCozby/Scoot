const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRolesMiddleware, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res, next) {
  const {accountId} = req.params

  const pathValidation = validateRequiredParams(['accountId'], req.params)

  if (!pathValidation.isValid) {
    return res.status(400).json({
      message: 'Missing url path parameters',
      pathParamsErrors: pathValidation.messageMap
    })
  }

  const [deleteErr] = await to(queries.remove({ accountId }))

  if (deleteErr) {
    return next(deleteErr)
  }

  res.status(204)
}

module.exports = [
  authMiddleware,
  verifyOneOfRolesMiddleware(['admin', 'manager']),
  routeHandler
]
